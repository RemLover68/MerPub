// Returns all dates from (today - yearsBack) to today, newest first
export function buildDateRange(yearsBack = 5) {
  const dates = []
  const end = new Date()
  const start = new Date()
  start.setFullYear(start.getFullYear() - yearsBack)

  const cur = new Date(end)
  while (cur >= start) {
    dates.push(toApiFormat(cur))
    cur.setDate(cur.getDate() - 1)
  }
  return dates
}

// ddmmaaaa  e.g. "22052026"
export function toApiFormat(date) {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return `${d}${m}${y}`
}

// iso string from ddmmaaaa
export function apiToIso(ddmmaaaa) {
  const d = ddmmaaaa.slice(0, 2)
  const m = ddmmaaaa.slice(2, 4)
  const y = ddmmaaaa.slice(4)
  return `${y}-${m}-${d}`
}

export function today() {
  return toApiFormat(new Date())
}
