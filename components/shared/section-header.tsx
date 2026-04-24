import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function SectionHeader({
  title,
  description,
  actions,
}: SectionHeaderProps) {
  return (
    <Card className="border-[#DDE5ED] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,251,253,1))] px-5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="mt-3 text-[1.35rem] font-bold text-[#102034]">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6B7280]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </Card>
  );
}
