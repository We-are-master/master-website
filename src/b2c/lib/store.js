/**
 * Estado da reserva: sobrevive a um refresh (sessionStorage) e pode nascer
 * de um link (/book?s=clean&size=2 vindo do hero, de um chip ou de anúncio).
 * O tipo de limpeza vai em `kind=deep`; sem ele, limpeza é end of tenancy.
 */
import {
  CLEAN_KINDS,
  DEFAULT_CLEAN_KIND,
  emptySelection,
  normalizeSelection,
  SERVICE_ORDER,
  PROPERTY_SIZES,
} from '../content/pricing.js'

const KEY = 'fx_b2c_booking_v1'

export function emptyBooking() {
  return {
    selection: emptySelection(),
    postcode: '',
    role: '',
    date: '',
    window: '',
    access: '',
    accessNote: '',
    parking: '',
    notes: '',
    contact: { firstName: '', lastName: '', email: '', phone: '' },
    address: { line1: '', line2: '' },
    marketing: false,
  }
}

export function loadBooking() {
  try {
    const raw = JSON.parse(window.sessionStorage.getItem(KEY) || 'null')
    if (!raw || typeof raw !== 'object') return emptyBooking()
    const base = emptyBooking()
    return {
      ...base,
      ...raw,
      selection: normalizeSelection(raw.selection || {}),
      contact: { ...base.contact, ...(raw.contact || {}) },
      address: { ...base.address, ...(raw.address || {}) },
    }
  } catch {
    return emptyBooking()
  }
}

export function saveBooking(booking) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(booking))
  } catch {
    /* sem storage: a reserva só não sobrevive ao refresh */
  }
}

export function clearBooking() {
  try {
    window.sessionStorage.removeItem(KEY)
  } catch {
    /* nada a limpar */
  }
}

/**
 * Link de reserva já preenchido. `preset` aceita os atalhos da página
 * (ex.: { services: ['clean'], size: '2', kind: 'deep', extras: { carpet: 2 } }).
 * O tipo padrão não entra no link: os links de hoje continuam iguais.
 */
export function bookingHref(preset = {}) {
  const q = new URLSearchParams()
  if (preset.services?.length) q.set('s', preset.services.join(','))
  if (preset.kind && preset.kind !== DEFAULT_CLEAN_KIND) q.set('kind', preset.kind)
  if (preset.size) q.set('size', preset.size)
  if (preset.bathrooms && preset.bathrooms > 1) q.set('bath', String(preset.bathrooms))
  if (preset.extras) {
    const list = Object.entries(preset.extras)
      .filter(([, v]) => v)
      .map(([k, v]) => (v > 1 ? `${k}:${v}` : k))
    if (list.length) q.set('x', list.join(','))
  }
  if (preset.paint) q.set('paint', preset.paint.option === 'rooms' ? `rooms:${preset.paint.rooms || 1}` : 'touchup')
  if (preset.paint?.materials) q.set('pm', '1')
  if (preset.fixPackage) q.set('fix', preset.fixPackage)
  if (preset.fixTasks?.length) q.set('tasks', preset.fixTasks.join(','))
  if (preset.cert?.length) q.set('cert', preset.cert.join(','))
  if (preset.boiler) q.set('boiler', '1')
  const s = q.toString()
  return s ? `/book?${s}` : '/book'
}

/** Aplica os parâmetros de um link de reserva por cima do estado salvo. */
export function applyQuery(booking, search) {
  const q = new URLSearchParams(search)
  if (![...q.keys()].some((k) => ['s', 'kind', 'size', 'bath', 'x', 'paint', 'pm', 'fix', 'tasks', 'cert', 'boiler', 'pc'].includes(k))) {
    return booking
  }
  const sel = { ...booking.selection }
  const services = (q.get('s') || '').split(',').filter((s) => SERVICE_ORDER.includes(s))
  if (services.length) sel.services = services
  // Link que pede limpeza sem `kind` é end of tenancy, como sempre foi,
  // mesmo que a sessão tenha guardado um deep clean de antes.
  const kind = q.get('kind')
  const knownKind = CLEAN_KINDS.some((k) => k.id === kind)
  if (services.includes('clean') || knownKind) {
    sel.clean = { ...sel.clean, kind: knownKind ? kind : DEFAULT_CLEAN_KIND }
  }
  const size = q.get('size')
  if (size && PROPERTY_SIZES.some((p) => p.id === size)) sel.size = size
  const bath = Number(q.get('bath'))
  if (bath >= 1) sel.bathrooms = bath
  const x = q.get('x')
  if (x) {
    const extras = {}
    for (const part of x.split(',')) {
      const [id, qty] = part.split(':')
      extras[id] = Number(qty) || 1
    }
    sel.clean = { ...sel.clean, extras }
  }
  const paint = q.get('paint')
  if (paint) {
    const [option, rooms] = paint.split(':')
    sel.paint = { option, rooms: Number(rooms) || 1, materials: q.get('pm') === '1' }
  }
  const fix = q.get('fix')
  const tasks = (q.get('tasks') || '').split(',').filter(Boolean)
  if (fix || tasks.length) sel.fix = { package: fix || null, tasks }
  const certs = (q.get('cert') || '').split(',').filter(Boolean)
  if (certs.length) sel.cert = { items: certs, boiler: q.get('boiler') === '1' }
  const pc = q.get('pc')
  return {
    ...booking,
    postcode: pc ? pc.toUpperCase().slice(0, 8) : booking.postcode,
    selection: normalizeSelection(sel),
  }
}
