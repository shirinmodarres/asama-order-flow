import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface ReconciliationCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function ReconciliationCard({
  title,
  subtitle,
  children,
}: ReconciliationCardProps) {
  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold text-[#102034]">{title}</h3>
      {subtitle ? (
        <p className="mt-1 text-sm leading-7 text-[#6B7280]">{subtitle}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </Card>
  );
}
