import { PackageOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
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
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[#102034]">
            خلاصه حواله خروج
          </h3>
          <p className="mt-1 text-sm text-[#6B7280]">اطلاعات ثبت اولیه حواله</p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-[14px] border border-[#DDE7F0] bg-[#F5F8FB] text-[#1F3A5F]">
          <PackageOpen className="size-5" />
        </span>
      </div>
      <dl className="mt-5 space-y-3 text-sm">
        <SummaryRow label="شماره حواله" value={slipNumber} />
        <SummaryRow label="تاریخ خروج" value={formatDate(exitDate)} />
        <SummaryRow label="مسئول ثبت" value={createdBy} />
      </dl>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E8EEF4] bg-[#FBFCFD] px-3.5 py-3">
      <dt className="text-[#6B7280]">{label}</dt>
      <dd className="font-semibold text-[#102034]">{value}</dd>
    </div>
  );
}
