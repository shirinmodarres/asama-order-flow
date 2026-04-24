import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#5F6E81]">{title}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-[#102034]">
            {formatNumber(value)}
          </p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-[14px] border border-[#DDE7F0] bg-[#F5F8FB] text-[#1F3A5F]">
          <BarChart3 className="size-5" />
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs leading-6 text-[#6B7280]">{hint}</p>
        <Badge variant="neutral">شاخص</Badge>
      </div>
    </Card>
  );
}
