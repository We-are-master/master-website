import { SignJWT, importPKCS8 } from 'jose'
import { growthServerEnv } from './load-env.js'

const TIMEZONE = 'Europe/London'
const SLOT_MINUTES = 15
const BASE_TIMES = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30']

function parseServiceAccount() {
  const raw = growthServerEnv().googleServiceAccountJson
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function getCalendarId() {
  return growthServerEnv().growthCalendarId || null
}

async function getAccessToken(sa) {
  const key = await importPKCS8(sa.private_key.replace(/\\n/g, '\n'), 'RS256')
  const jwt = await new SignJWT({ scope: 'https://www.googleapis.com/auth/calendar' })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(sa.client_email)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(key)

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  const data = await res.json()
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || 'Failed to obtain Google access token')
  }
  return data.access_token
}

function londonParts(d) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
  const parts = fmt.formatToParts(d)
  const get = (type) => parts.find((p) => p.type === type)?.value || ''
  return { dow: get('weekday'), num: Number(get('day')), mon: get('month') }
}

function slotAt(baseDate, time) {
  const [h, m] = time.split(':').map(Number)
  const isoDate = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(baseDate)
  const local = `${isoDate}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
  const asUtc = new Date(`${local}Z`)
  const londonStr = asUtc.toLocaleString('en-US', { timeZone: TIMEZONE })
  const offset = asUtc.getTime() - new Date(londonStr).getTime()
  return new Date(asUtc.getTime() + offset)
}

function addDays(d, n) {
  const x = new Date(d)
  x.setUTCDate(x.getUTCDate() + n)
  return x
}

function isWeekday(d) {
  const wd = new Intl.DateTimeFormat('en-GB', { timeZone: TIMEZONE, weekday: 'short' }).format(d)
  return wd !== 'Sat' && wd !== 'Sun'
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart
}

export function generateCandidateSlots(maxWeekdays = 5) {
  const out = []
  let cursor = addDays(new Date(), 2)
  let weekdays = 0
  while (weekdays < maxWeekdays) {
    if (isWeekday(cursor)) {
      const p = londonParts(cursor)
      for (const time of BASE_TIMES) {
        const start = slotAt(cursor, time)
        out.push({
          iso: start.toISOString(),
          dow: p.dow,
          num: p.num,
          mon: p.mon,
          full: `${p.dow}, ${p.num} ${p.mon}`,
          time,
        })
      }
      weekdays++
    }
    cursor = addDays(cursor, 1)
  }
  return out
}

function groupSlotsByDay(slots) {
  const map = new Map()
  for (const s of slots) {
    if (!map.has(s.full)) {
      map.set(s.full, { dow: s.dow, num: s.num, mon: s.mon, full: s.full, times: [] })
    }
    map.get(s.full).times.push({ time: s.time, iso: s.iso })
  }
  return Array.from(map.values())
}

async function fetchBusy(token, calendarId, timeMin, timeMax) {
  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeMin, timeMax, timeZone: TIMEZONE, items: [{ id: calendarId }] }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Google freeBusy failed')
  return data.calendars?.[calendarId]?.busy || []
}

export async function listAvailableSlots(maxWeekdays = 5) {
  const sa = parseServiceAccount()
  const calendarId = getCalendarId()
  const candidates = generateCandidateSlots(maxWeekdays)

  if (!sa || !calendarId) {
    return { days: groupSlotsByDay(candidates), fallback: true }
  }

  try {
    const token = await getAccessToken(sa)
    const timeMin = candidates[0]?.iso || new Date().toISOString()
    const timeMax = new Date(Date.now() + 14 * 86400_000).toISOString()
    const busy = await fetchBusy(token, calendarId, timeMin, timeMax)
    const open = candidates.filter((slot) => {
      const start = new Date(slot.iso)
      const end = new Date(start.getTime() + SLOT_MINUTES * 60_000)
      return !busy.some((b) => overlaps(start, end, new Date(b.start), new Date(b.end)))
    })
    return { days: groupSlotsByDay(open), fallback: false }
  } catch (err) {
    console.warn('[growth-api] calendar fallback:', err.message)
    return { days: groupSlotsByDay(candidates), fallback: true }
  }
}

export async function isSlotAvailable(isoStart) {
  const sa = parseServiceAccount()
  const calendarId = getCalendarId()
  if (!sa || !calendarId) return true

  const start = new Date(isoStart)
  const end = new Date(start.getTime() + SLOT_MINUTES * 60_000)
  const token = await getAccessToken(sa)
  const busy = await fetchBusy(
    token,
    calendarId,
    new Date(start.getTime() - 60_000).toISOString(),
    new Date(end.getTime() + 60_000).toISOString(),
  )
  return !busy.some((b) => overlaps(start, end, new Date(b.start), new Date(b.end)))
}
