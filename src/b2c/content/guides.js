/**
 * Guia de cada serviço, no molde da Housekeep (pesquisa de 21/09/2026): em vez
 * de uma tabela de preço solta, uma comparação do que cada opção inclui, o que
 * o cliente prepara antes da visita e os extras da mesma visita.
 *
 * Tudo aqui repete fatos que já estão no site (pricing.js, copy.js, FAQ):
 * nada de prazo, equipe ou garantia nova. Inglês britânico, sem travessão.
 *
 * Célula da comparação: true = incluso, false = não, texto = o valor.
 */
import { CERT, CLEAN, FIX, PAINT, cleanPrice, formatGBP } from './pricing.js'
import { PROMISES } from './site.js'

const RECLEAN = PROMISES.recleanDays.value
const from = (n) => `From ${formatGBP(n)}`

const ACCESS = {
  icon: 'key',
  title: 'Tell us how we get in',
  text: 'Be there, leave keys with your agent or concierge, or give us a key safe code. We confirm the plan the day before.',
}

/** Os dois tipos de limpeza lado a lado: a mesma tabela nas duas páginas. */
const CLEAN_COMPARE = {
  title: 'Which clean do you need',
  lede: 'Both follow the same room-by-room checklist and come with a photo of every room. The difference is whether the place is empty.',
  columns: [
    { id: 'eot', name: 'Moving out', price: from(cleanPrice('studio', 'eot')) },
    { id: 'deep', name: 'Deep clean', price: from(cleanPrice('studio', 'deep')) },
  ],
  rows: [
    { label: 'Best for', cells: ['An empty property on check-out day', 'The home you live in'] },
    { label: 'Oven deep clean', cells: [true, true] },
    { label: 'Inside cupboards and wardrobes', cells: ['All of them', 'The ones you empty'] },
    { label: 'Worked around your furniture', cells: [false, true] },
    { label: 'Photo of every room', cells: [true, true] },
    { label: `Free re-clean within ${RECLEAN} days`, cells: [true, false] },
  ],
}

export const GUIDES = {
  eot: {
    ...CLEAN_COMPARE,
    prep: [
      { icon: 'box', title: 'Empty the property', text: 'It works best empty. Still moving out on the day? Say so in the booking notes and we plan around you.' },
      { icon: 'zap', title: 'Keep the power and hot water on', text: 'The team needs both to clean properly, so leave them on until we finish.' },
      ACCESS,
    ],
    extras: 'clean',
  },
  deep: {
    ...CLEAN_COMPARE,
    prep: [
      { icon: 'box', title: 'Clear the surfaces', text: 'Clear the worktops and surfaces you want cleaned. We work around everything else.' },
      { icon: 'door', title: 'Empty the cupboards you want done', text: 'We clean inside any cupboard or wardrobe you empty for us.' },
      ACCESS,
    ],
    extras: 'clean',
  },
  paint: {
    title: 'Touch-ups or a full repaint',
    lede: 'Touch-ups take the marks of living off the whole property. A full repaint gives chosen rooms a proper finish.',
    columns: PAINT.options.map((o) => ({
      id: o.id,
      name: o.label,
      price: o.unit ? `${formatGBP(o.price)} a ${o.unit}` : formatGBP(o.price),
    })),
    rows: [
      { label: 'Best for', cells: ['Scuffs, marks and holes across the property', 'Walls that need a proper finish'] },
      { label: 'What we do', cells: ['Holes filled, marks and scuffs touched up', 'Walls in two coats, edges cut in cleanly'] },
      { label: 'How it is priced', cells: ['Up to 3.5 hours', 'Per room, you choose which'] },
      { label: `Paint and materials pack, ${formatGBP(PAINT.materials.price)}`, cells: ['Optional', 'Optional'] },
      { label: 'Photo of every room', cells: [true, true] },
    ],
    prep: [
      { icon: 'brush', title: 'Choose the paint', text: `Add the materials pack, or leave the landlord’s paint on site and we use it.` },
      { icon: 'layers', title: 'Book it with the clean', text: 'In one booking we paint first and clean last, so no dust or touch-up marks are left behind.' },
      ACCESS,
    ],
    extras: 'paint',
  },
  fix: {
    title: 'Half day or full day',
    lede: 'Repairs are booked by time, so you know how long we will be there before we arrive. No call-out fee on either.',
    columns: FIX.packages.map((p) => ({ id: p.id, name: p.label, price: formatGBP(p.price) })),
    rows: [
      { label: 'Time on site', cells: FIX.packages.map((p) => p.detail) },
      { label: 'Call-out fee', cells: ['None', 'None'] },
      { label: 'Parts', cells: ['Billed at the end, listed in your report', 'Billed at the end, listed in your report'] },
      { label: 'Photo when done', cells: [true, true] },
    ],
    prep: [
      { icon: 'list', title: 'Tick the jobs on your list', text: 'Pick them in the booking and we suggest a half or full day.' },
      { icon: 'layers', title: 'Book it with the clean', text: 'In one booking repairs go first, so the dust is cleaned away after.' },
      ACCESS,
    ],
    extras: null,
  },
  cert: {
    title: 'What each certificate covers',
    end: '.',
    lede: 'Book the ones that are due. Each one is signed by the engineer who does it, and we keep the expiry date on file for the next one.',
    columns: CERT.items.map((i) => ({
      id: i.id,
      name: i.short,
      price: i.prices ? from(Math.min(...Object.values(i.prices).filter((v) => v != null))) : formatGBP(i.price),
    })),
    rows: [
      { label: 'What is checked', cells: CERT.items.map((i) => i.detail) },
      { label: 'How often', cells: CERT.items.map((i) => i.valid.replace(/^Renew every/, 'Every')) },
      { label: 'Photo report the same day', cells: CERT.items.map(() => true) },
    ],
    prep: [
      { icon: 'shield', title: 'Book what is due', text: 'Tick the certificates you need. Add a boiler service to the gas check and it happens in the same visit.' },
      { icon: 'alert', title: 'If something fails', text: 'You get what failed and why, with a fixed price to put it right. Nothing is done until you say yes.' },
      ACCESS,
    ],
    extras: 'cert',
  },
}

/** Extras da mesma visita, com o preço que a reserva cobra. */
export function guideExtras(kind) {
  if (kind === 'clean') {
    return [
      { id: 'bath', label: 'Extra bathroom', detail: `${CLEAN.includedBathrooms} is included in the price`, price: formatGBP(CLEAN.extraBathroom) },
      ...CLEAN.extras.map((x) => ({
        id: x.id,
        label: x.label,
        detail: x.detail,
        price: x.unit ? `${formatGBP(x.price)} a ${x.unit}` : formatGBP(x.price),
      })),
    ]
  }
  if (kind === 'paint') {
    return [{ id: PAINT.materials.id, label: PAINT.materials.label, detail: PAINT.materials.detail, price: formatGBP(PAINT.materials.price) }]
  }
  if (kind === 'cert') {
    const b = CERT.items[0].addOn
    return [{ id: b.id, label: 'Boiler service', detail: 'Same engineer, same visit as the gas check', price: `+${formatGBP(b.price)}` }]
  }
  return []
}
