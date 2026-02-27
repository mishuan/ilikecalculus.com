function padToTwo(value: number) {
  return String(value).padStart(2, "0");
}

export function toLocalDateTimeValue(date: Date) {
  return `${date.getFullYear()}-${padToTwo(date.getMonth() + 1)}-${padToTwo(date.getDate())}T${padToTwo(
    date.getHours(),
  )}:${padToTwo(date.getMinutes())}`;
}

export function toDayKey(date: Date) {
  return `${date.getFullYear()}-${padToTwo(date.getMonth() + 1)}-${padToTwo(date.getDate())}`;
}

export function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${padToTwo(date.getMonth() + 1)}`;
}

export function fromDayKey(dayKey: string) {
  const [year, month, day] = dayKey.split("-").map((value) => Number(value));
  return new Date(year, month - 1, day);
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}
