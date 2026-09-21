/**
 * Endereço pela API de geocoding v6 do Mapbox (token público do navegador,
 * o mesmo do OS). A busca fica presa num retângulo em volta da Grande
 * Londres: só atendemos Londres, e sem isso "21 Rye Lane" trazia primeiro
 * endereços de Kent e Halifax.
 *
 * Do Mapbox guardamos só o que o cliente confirma (número, rua, postcode).
 * Coordenada não vai para o servidor: o OS geocodifica o job sozinho.
 */
import { formatPostcode, isCovered } from '../content/site.js'

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''
const BASE = 'https://api.mapbox.com/search/geocode/v6'
const LONDON_BBOX = '-0.56,51.25,0.37,51.72'
const LONDON_CENTRE = '-0.1276,51.5072'

/** O bairro (Peckham) diz mais a um londrino que o distrito (Southwark). */
function area(ctx = {}) {
  return ctx.neighborhood?.name || ctx.locality?.name || ctx.district?.name || ctx.place?.name || ''
}

function toPlace(feature) {
  const p = feature.properties || {}
  const ctx = p.context || {}
  const [lng, lat] = feature.geometry?.coordinates || []
  const postcode = formatPostcode(ctx.postcode?.name || (p.feature_type === 'postcode' ? p.name : ''))
  return {
    id: p.mapbox_id || feature.id || `${p.name}-${lng}-${lat}`,
    type: p.feature_type,
    line1: p.feature_type === 'address' ? p.name : '',
    street: ctx.address?.street_name || ctx.street?.name || '',
    postcode,
    area: area(ctx),
    // tudo que o cliente pode digitar para achar o lugar, para o ranking
    words: [ctx.neighborhood?.name, ctx.locality?.name, ctx.district?.name, postcode].filter(Boolean).join(' '),
    lng,
    lat,
  }
}

const words = (t = '') =>
  t
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

/**
 * O Mapbox ordena por proximidade do centro de Londres: "21 rye lan" trazia
 * "21 The Rye" antes de "21 Rye Lane". Reordena pelo quanto o que foi
 * digitado bate, na ordem, com o começo das palavras do endereço.
 */
function rankByText(query, places) {
  const q = words(query)
  const score = (p) => {
    const target = words(`${p.type === 'postcode' ? p.postcode : p.line1} ${p.words}`)
    let i = 0
    let hits = 0
    for (const token of q) {
      const at = target.findIndex((w, k) => k >= i && w.startsWith(token))
      if (at === -1) continue
      hits += at === i ? 2 : 1
      i = at + 1
    }
    return hits
  }
  return places
    .map((p, idx) => ({ p, idx, s: score(p) }))
    .sort((a, b) => b.s - a.s || a.idx - b.idx)
    .map((x) => x.p)
}

/** Sugestões enquanto o cliente digita: endereços e postcodes de Londres. */
export async function searchPlaces(query, signal) {
  const params = new URLSearchParams({
    q: query,
    country: 'gb',
    types: 'address,postcode',
    autocomplete: 'true',
    limit: '6',
    language: 'en',
    bbox: LONDON_BBOX,
    proximity: LONDON_CENTRE,
    access_token: MAPBOX_TOKEN,
  })
  const res = await fetch(`${BASE}/forward?${params}`, { signal })
  if (!res.ok) throw new Error(`mapbox ${res.status}`)
  const data = await res.json()
  const places = (data.features || [])
    .map(toPlace)
    // Postcode parcial ("SE15") não localiza um prédio, e o retângulo pega
    // pedaço de Kent e Surrey: só fica o que a gente atende.
    .filter((p) => (p.type === 'address' || (p.type === 'postcode' && p.postcode.includes(' '))) && isCovered(p.postcode))
  return rankByText(query, places)
}

/** Postcode digitado ou vindo de link: centro e bairro. */
export async function findPostcode(postcode, signal) {
  const params = new URLSearchParams({ q: postcode, country: 'gb', types: 'postcode', limit: '1', access_token: MAPBOX_TOKEN })
  const res = await fetch(`${BASE}/forward?${params}`, { signal })
  if (!res.ok) throw new Error(`mapbox ${res.status}`)
  const f = (await res.json()).features?.[0]
  return f ? toPlace(f) : null
}

/**
 * Ruas em volta do centro de um postcode, as do próprio postcode primeiro.
 * Um postcode britânico cobre uns 15 endereços, quase sempre numa rua só.
 */
export async function streetsNear({ lng, lat, postcode }, signal) {
  const params = new URLSearchParams({
    longitude: String(lng),
    latitude: String(lat),
    types: 'street',
    limit: '5',
    country: 'gb',
    access_token: MAPBOX_TOKEN,
  })
  const res = await fetch(`${BASE}/reverse?${params}`, { signal })
  if (!res.ok) throw new Error(`mapbox ${res.status}`)
  const features = (await res.json()).features || []
  const seen = new Set()
  return features
    .map((f) => ({ name: f.properties?.name || '', same: formatPostcode(f.properties?.context?.postcode?.name || '') === postcode }))
    .filter((s) => s.name && !seen.has(s.name) && seen.add(s.name))
    .sort((a, b) => Number(b.same) - Number(a.same))
    .slice(0, 3)
    .map((s) => s.name)
}

export function staticMapUrl({ lng, lat }) {
  if (!MAPBOX_TOKEN || lng == null || lat == null) return null
  const pin = `pin-l+ed4b00(${lng},${lat})`
  return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${pin}/${lng},${lat},15.5,0/640x200@2x?access_token=${MAPBOX_TOKEN}`
}
