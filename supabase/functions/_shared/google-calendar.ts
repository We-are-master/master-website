/**
 * Google Calendar helpers (service account) for Fixfy Growth onboarding slots.
 */

import { SignJWT, importPKCS8 } from 'https://deno.land/x/jose@v4.14.4/index.ts'

const TIMEZONE = 'Europe/London'
const SLOT_MINUTES = 15
const BASE_TIMES = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30']

export interface ServiceAccount {
  client_email: string
  private_key: string
}

export interface CalendarSlot {
  iso: string
  dow: string
  num: number
  mon: string
  full: string
  time: string
}

interface BusyBlock {
  start: string
  end: string
}

function parseServiceAccount(): ServiceAccount | null {
  const raw = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')
  if (!raw) return null
  try {
    return JSON.parse(raw) as ServiceAccount
  } catch {
    return null
  }
}

export function getCalendarId(): string | null {
  return Deno.env.get('GROWTH_CALENDAR_ID') || null
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const key = await importPKCS8(sa.private_key.replace(/\\n/g, '\n'), 'RS256')
  const jwt = await new SignJWT({
    scope: 'https://www.googleapis.com/auth/calendar',
  })
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
  return data.access_token as string
}

function londonParts(d: Date) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
  const parts = fmt.formatToParts(d)
  const get = (type: string) => parts.find((p) => p.type === type)?.value || ''
  return {
    dow: get('weekday'),
    num: Number(get('day')),
    mon: get('month'),
  }
}

function slotAt(baseDate: Date, time: string): Date {
  const [h, m] = time.split(':').map(Number)
  const isoDate = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(baseDate)
  const local = `${isoDate}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
  const asUtc = new Date(local + 'Z')
  const londonStr = asUtc.toLocaleString('en-US', { timeZone: TIMEZONE })
  const offset = asUtc.getTime() - new Date(londonStr).getTime()
  return new Date(asUtc.getTime() + offset)
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setUTCDate(x.getUTCDate() + n)
  return x
}

function isWeekday(d: Date): boolean {
  const wd = new Intl.DateTimeFormat('en-GB', { timeZone: TIMEZONE, weekday: 'short' }).format(d)
  return wd !== 'Sat' && wd !== 'Sun'
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart
}

export function generateCandidateSlots(maxWeekdays = 5): CalendarSlot[] {
  const out: CalendarSlot[] = []
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

async function fetchBusy(
  token: string,
  calendarId: string,
  timeMin: string,
  timeMax: string,
): Promise<BusyBlock[]> {
  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      timeZone: TIMEZONE,
      items: [{ id: calendarId }],
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error?.message || 'Google freeBusy failed')
  }
  const cal = data.calendars?.[calendarId]
  return (cal?.busy || []) as BusyBlock[]
}

function groupSlotsByDay(slots: CalendarSlot[]) {
  const map = new Map<string, { dow: string; num: number; mon: string; full: string; times: Array<{ time: string; iso: string }> }>()
  for (const s of slots) {
    if (!map.has(s.full)) {
      map.set(s.full, { dow: s.dow, num: s.num, mon: s.mon, full: s.full, times: [] })
    }
    map.get(s.full)!.times.push({ time: s.time, iso: s.iso })
  }
  return Array.from(map.values())
}

export async function listAvailableSlots(maxWeekdays = 5): Promise<{
  days: Array<{ dow: string; num: number; mon: string; full: string; times: Array<{ time: string; iso: string }> }>
  fallback: boolean
}> {
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
    console.warn('[google-calendar] availability fallback:', err)
    return { days: groupSlotsByDay(candidates), fallback: true }
  }
}

export async function isSlotAvailable(isoStart: string): Promise<boolean> {
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

export interface CreateEventInput {
  businessName: string
  leadName: string
  leadEmail: string
  leadPhone?: string
  slotStart: string
  plan: string
  payMode: string
  quizAnswers: Record<string, unknown>
  notifyEmail: string
}

export async function createOnboardingEvent(input: CreateEventInput): Promise<{ eventId: string; htmlLink: string }> {
  const sa = parseServiceAccount()
  const calendarId = getCalendarId()
  if (!sa || !calendarId) {
    throw new Error('Google Calendar not configured')
  }

  const token = await getAccessToken(sa)
  const start = new Date(input.slotStart)
  const end = new Date(start.getTime() + SLOT_MINUTES * 60_000)

  const desc = [
    `Business: ${input.businessName}`,
    `Contact: ${input.leadName}`,
    input.leadPhone ? `Phone: ${input.leadPhone}` : '',
    `Plan: ${input.plan} (${input.payMode})`,
    '',
    'Quiz:',
    ...Object.entries(input.quizAnswers).map(([k, v]) => `- ${k}: ${v}`),
  ].filter(Boolean).join('\n')

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: `Fixfy Growth onboarding — ${input.businessName}`,
        description: desc,
        start: { dateTime: start.toISOString(), timeZone: TIMEZONE },
        end: { dateTime: end.toISOString(), timeZone: TIMEZONE },
        attendees: [
          { email: input.leadEmail, displayName: input.leadName },
          { email: input.notifyEmail, displayName: 'Fixfy Growth' },
        ],
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'email', minutes: 60 },
          ],
        },
      }),
    },
  )

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error?.message || 'Failed to create calendar event')
  }

  return {
    eventId: data.id as string,
    htmlLink: (data.htmlLink as string) || '',
  }
}
