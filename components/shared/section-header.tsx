import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function SectionHeader({ title, description, actions }: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 rounded-[12px] border border-[#E5E7EB] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div>
        <p className="text-[11px] font-medium tracking-wide text-[#6B7280]">نمای عملیاتی</p>
        <h2 className="mt-1 text-lg font-semibold text-[#1F3A5F]">{title}</h2>
        {description ? <p className="mt-1.5 max-w-3xl text-sm text-[#6B7280]">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
