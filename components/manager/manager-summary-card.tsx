import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/expert/utils";

interface ManagerSummaryCardProps {
  title: string;
  value: number | string;
  hint: string;
}

export function ManagerSummaryCard({
  title,
  value,
  hint,
}: ManagerSummaryCardProps) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#5F6E81]">{title}</p>
          <p className="mt-3 text-2xl font-black tracking-tight text-[#102034] sm:text-3xl">
            {typeof value === "number" ? formatNumber(value) : value}
          </p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[14px] border border-[#DDE7F0] bg-[#F5F8FB] text-[#1F3A5F] sm:size-11">
          <BarChart3 className="size-5" />
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-6 text-[#6B7280]">{hint}</p>
        <Badge variant="neutral">شاخص</Badge>
      </div>
    </Card>
  );
}
