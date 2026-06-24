const TIMEZONE = 'Europe/London'

/** 00:00 on a calendar day in Europe/London */
function londonMidnight(year, month, day) {
  const start = Date.UTC(year, month - 1, day - 1, 20, 0, 0)
  for (let i = 0; i < 48; i++) {
    const probe = new Date(start + i * 3600_000)
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-GB', {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      })
        .formatToParts(probe)
        .map((p) => [p.type, p.value]),
    )
    if (
      Number(parts.year) === year &&
      Number(parts.month) === month &&
      Number(parts.day) === day &&
      parts.hour === '00' &&
      parts.minute === '00'
    ) {
      return probe
    }
  }
  throw new Error(`Could not resolve London midnight for ${year}-${month}-${day}`)
}

/**
 * Next billing date: 1st of the month on or after (today + 30 days), Europe/London.
 * e.g. pay 23 Jun → next bill 1 Aug.
 */
export function nextBillingAnchor(from = new Date()) {
  const min = new Date(from.getTime() + 30 * 24 * 60 * 60 * 1000)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(min)
  const startYear = Number(parts.find((p) => p.type === 'year').value)
  const startMonth = Number(parts.find((p) => p.type === 'month').value)

  for (let i = 0; i < 14; i++) {
    let month = startMonth + i
    let year = startYear
    while (month > 12) {
      month -= 12
      year += 1
    }
    const anchor = londonMidnight(year, month, 1)
    if (anchor.getTime() >= min.getTime()) return anchor
  }

  let month = startMonth + 14
  let year = startYear
  while (month > 12) {
    month -= 12
    year += 1
  }
  return londonMidnight(year, month, 1)
}

export function formatBillingAnchor(date) {
  return date.toLocaleDateString('en-GB', {
    timeZone: TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
