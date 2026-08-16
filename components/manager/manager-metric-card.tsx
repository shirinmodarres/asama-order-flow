import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface ManagerMetricCardProps {
  title: string;
  value: string;
  footer: string;
  icon: ReactNode;
  iconTone: "green" | "blue" | "amber";
}

export function ManagerMetricCard({
  title,
  value,
  footer,
  icon,
  iconTone,
}: ManagerMetricCardProps) {
  const toneStyles =
    iconTone === "blue"
      ? "bg-[#E8F1FF] text-[#3B82F6]"
      : iconTone === "amber"
        ? "bg-[#FFF2DF] text-[#F59E0B]"
        : "bg-[#E7F7EA] text-[#6CAE75]";

  return (
    <Card className="rounded-[24px] border border-[#DDE7F0] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-4">
        <span
          className={`flex size-12 shrink-0 items-center justify-center rounded-full ${toneStyles}`}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1 text-right">
          <p className="text-sm font-semibold text-[#6B7280]">{title}</p>
          <p className="mt-2 text-md font-bold tracking-tight text-[#102034] sm:text-[2rem]">
            {value}
          </p>
          <p className="mt-1 text-sm font-medium text-[#6B7280]">{footer}</p>
        </div>
      </div>
    </Card>
  );
}
