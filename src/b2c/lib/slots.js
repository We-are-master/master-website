/**
 * Datas e janelas de chegada da reserva.
 *
 * Regra simples até o agente de capacidade do plano 3 existir: segunda a
 * sábado, a partir de amanhã (ou depois de amanhã quando já passou das 14h
 * em Londres), 21 dias à frente. A janela vai para o OS no formato
 * "HH:MM - HH:MM", que o POST /api/jobs aceita.
 */

const TZ = 'Europe/London'

function londonParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const get = (type) => Number(parts.find((p) => p.type === type)?.value)
  return { y: get('year'), m: get('month'), d: get('day'), h: get('hour') }
}

const pad = (n) => String(n).padStart(2, '0')

/** Data de calendário (sem fuso) somada de dias, em UTC para não escorregar. */
function addDays({ y, m, d }, days) {
  const t = new Date(Date.UTC(y, m - 1, d + days))
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), dow: t.getUTCDay() }
}

export const CUTOFF_HOUR = 14
export const DAYS_AHEAD = 21

export function bookableDates(now = new Date()) {
  const today = londonParts(now)
  const firstOffset = today.h >= CUTOFF_HOUR ? 2 : 1
  const out = []
  for (let i = firstOffset; out.length < DAYS_AHEAD && i < 60; i += 1) {
    const day = addDays(today, i)
    if (day.dow === 0) continue // domingo fechado
    const iso = `${day.y}-${pad(day.m)}-${pad(day.d)}`
    const asDate = new Date(Date.UTC(day.y, day.m - 1, day.d, 12))
    out.push({
      iso,
      weekday: asDate.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' }),
      day: day.d,
      month: asDate.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }),
      isSaturday: day.dow === 6,
    })
  }
  return out
}

/**
 * As mesmas janelas do OS (master-os `src/lib/job-arrival-window.ts`,
 * ARRIVAL_SLOTS), com os mesmos ids e horários. O `id` vai no
 * `arrival_time` do POST /api/jobs, que aceita o id do slot e casa exato
 * (o "09:00" solto viraria "sem janela" em vez do 9am sharp).
 * 08-09, 18-20 e o 9am sharp existem no OS mas ficam travados no site
 * (dono, 18/09/2026).
 */
export const WINDOWS = [
  { id: 'nine_sharp', title: '9am sharp', label: '9am sharp', phrase: 'at 9am sharp', range: '09:00', locked: true },
  { id: 'earlier_morning', title: 'Early', label: '8am to 9am', phrase: 'between 8am and 9am', range: '08:00 - 09:00', locked: true },
  { id: 'morning', title: 'Morning', label: '9am to 12pm', phrase: 'between 9am and 12pm', range: '09:00 - 12:00' },
  { id: 'early_afternoon', title: 'Early afternoon', label: '12pm to 3pm', phrase: 'between 12pm and 3pm', range: '12:00 - 15:00' },
  { id: 'afternoon', title: 'Afternoon', label: '3pm to 6pm', phrase: 'between 3pm and 6pm', range: '15:00 - 18:00' },
  { id: 'evening', title: 'Evening', label: '6pm to 8pm', phrase: 'between 6pm and 8pm', range: '18:00 - 20:00', locked: true },
  { id: 'all_day', title: 'Any time', label: '9am to 6pm', phrase: 'any time between 9am and 6pm', range: '09:00 - 18:00' },
]

/** O que o cliente pode escolher, na ordem do dia. */
export const BOOKABLE_WINDOWS = ['morning', 'early_afternoon', 'afternoon', 'all_day'].map((id) =>
  WINDOWS.find((w) => w.id === id && !w.locked),
).filter(Boolean)

export function windowsFor() {
  return BOOKABLE_WINDOWS
}

export function findWindow(id) {
  return BOOKABLE_WINDOWS.find((w) => w.id === id) || null
}

export function formatLongDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
}

export function isBookableDate(iso, now = new Date()) {
  return bookableDates(now).some((d) => d.iso === iso)
}
