import { format } from "date-fns"

export function formatDatetime(
  value: Date | string | number,
  pattern: string = "HH:mm:ss dd/MM/yyyy"
): string {
  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return ""
  return format(date, pattern)
}
