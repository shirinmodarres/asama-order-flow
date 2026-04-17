interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[12px] border border-dashed border-[#D1D5DB] bg-white p-12 text-center shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <p className="text-base font-semibold text-[#1F3A5F]">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[#6B7280]">{description}</p>
      <p className="mt-4 text-xs text-[#9CA3AF]">در صورت نیاز فیلترها را بازنشانی کنید یا داده جدید ثبت نمایید.</p>
    </div>
  );
}
