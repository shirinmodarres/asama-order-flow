import type { ReactNode } from "react";

interface ReconciliationCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function ReconciliationCard({ title, subtitle, children }: ReconciliationCardProps) {
  return (
    <section className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-[#1F3A5F]">{title}</h3>
      {subtitle ? <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
