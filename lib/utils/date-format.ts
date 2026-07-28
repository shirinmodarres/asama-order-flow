const jalaliDateFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const jalaliDateTimeFormatter = new Intl.DateTimeFormat(
  "fa-IR-u-ca-persian",
  {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  },
);

function normalizeDateValue(
  value: string | Date | null | undefined,
): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatJalaliDate(
  value: string | Date | null | undefined,
  fallback = "-",
): string {
  const date = normalizeDateValue(value);
  if (!date) return fallback;
  return jalaliDateFormatter.format(date);
}

export function formatJalaliDateTime(
  value: string | Date | null | undefined,
  fallback = "-",
): string {
  const date = normalizeDateValue(value);
  if (!date) return fallback;
  return jalaliDateTimeFormatter.format(date);
}
