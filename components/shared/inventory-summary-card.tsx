import { Boxes } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/expert/utils";

interface InventorySummaryCardProps {
  title: string;
  value: number;
  hint: string;
}

export function InventorySummaryCard({
  title,
  value,
  hint,
}: InventorySummaryCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[#6B7280]">
            {title}
          </p>
          <p className="mt-3 text-3xl font-black tracking-tight text-[#102034]">
            {formatNumber(value)}
          </p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-[14px] border border-[#DDE7F0] bg-[#F5F8FB] text-[#1F3A5F]">
          <Boxes className="size-5" />
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs leading-6 text-[#6B7280]">{hint}</p>
        <Badge variant="brand">موجودی</Badge>
      </div>
    </Card>
  );
}
