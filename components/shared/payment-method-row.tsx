import type { ReactNode } from "react";

const EMPTY_VALUES = new Set(["", "-", "- ", "null", "undefined"]);

export function getPaymentMethodLabel() {
  return "روش پرداخت";
}

export function formatPaymentMethod(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = String(value).trim();
  return EMPTY_VALUES.has(text.toLowerCase()) ? "" : text;
}

export function PaymentMethodRow({
  value,
  fallback,
}: {
  value?: string | null;
  fallback?: string | null;
}) {
  const displayValue = formatPaymentMethod(value || fallback || "");
  if (!displayValue) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E8EEF4] bg-[#FBFCFD] px-3.5 py-3">
      <dt className="text-[#6B7280]">{getPaymentMethodLabel()}</dt>
      <dd className="font-semibold text-[#102034]">{displayValue}</dd>
    </div>
  );
}
