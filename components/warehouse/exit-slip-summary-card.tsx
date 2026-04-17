import { formatDate } from "@/lib/expert/utils";

interface ExitSlipSummaryCardProps {
  slipNumber: string;
  exitDate: string;
  createdBy: string;
}

export function ExitSlipSummaryCard({
  slipNumber,
  exitDate,
  createdBy,
}: ExitSlipSummaryCardProps) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-[#1F3A5F]">
        خلاصه حواله خروج
      </h3>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-[#6B7280]">شماره حواله</dt>
          <dd className="font-semibold text-[#1F3A5F]">{slipNumber}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[#6B7280]">تاریخ خروج</dt>
          <dd className="font-semibold text-[#334155]">
            {formatDate(exitDate)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[#6B7280]">مسئول ثبت</dt>
          <dd className="font-semibold text-[#334155]">{createdBy}</dd>
        </div>
      </dl>
    </div>
  );
}
