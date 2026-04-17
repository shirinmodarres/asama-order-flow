import { formatNumber } from "@/lib/expert/utils";

interface ManagerSummaryCardProps {
  title: string;
  value: number;
  hint: string;
}

export function ManagerSummaryCard({
  title,
  value,
  hint,
}: ManagerSummaryCardProps) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <p className="text-sm text-[#6B7280]">{title}</p>
      <p className="mt-2 text-2xl font-bold text-[#1F3A5F]">
        {formatNumber(value)}
      </p>
      <p className="mt-2 text-xs text-[#6B7280]">{hint}</p>
    </div>
  );
}
