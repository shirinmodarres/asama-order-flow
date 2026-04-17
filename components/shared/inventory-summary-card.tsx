import { formatNumber } from "@/lib/expert/utils";

interface InventorySummaryCardProps {
  title: string;
  value: number;
  hint: string;
}

export function InventorySummaryCard({ title, value, hint }: InventorySummaryCardProps) {
  return (
    <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <p className="text-xs font-medium text-[#6B7280]">{title}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-[#1F3A5F]">{formatNumber(value)}</p>
      <p className="mt-2 text-xs text-[#6B7280]">{hint}</p>
    </div>
  );
}
