export function toDayKey(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function toInterviewDayKey(value: string | null) {
  if (!value) {
    return null
  }

  return value.slice(0, 10)
}

export function toCalendarDate(value: string) {
  const dayKey = toInterviewDayKey(value)
  return dayKey ? new Date(`${dayKey}T12:00:00`) : null
}

export function formatInterviewStatus(status: string) {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatInterviewDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : 'Schedule pending'
}

export function formatInterviewTime(value: string | null) {
  if (!value) {
    return 'Time to be confirmed'
  }

  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}
