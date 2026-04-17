interface ProcessStatusCardProps {
  currentStage: string;
  lastUpdated: string;
}

export function ProcessStatusCard({
  currentStage,
  lastUpdated,
}: ProcessStatusCardProps) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-[#1F3A5F]">وضعیت فرآیند</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-[#6B7280]">مرحله جاری</dt>
          <dd className="font-medium text-[#334155]">{currentStage}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[#6B7280]">آخرین تغییر</dt>
          <dd className="font-medium text-[#334155]">{lastUpdated}</dd>
        </div>
      </dl>
    </div>
  );
}
