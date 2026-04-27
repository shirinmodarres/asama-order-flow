import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProcessStatusCardProps {
  currentStage: string;
  lastUpdated: string;
}

export function ProcessStatusCard({
  currentStage,
  lastUpdated,
}: ProcessStatusCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[#102034]">
            وضعیت فرآیند
          </h3>
          <p className="mt-1 text-sm text-[#6B7280]">خلاصه مرحله جاری سفارش</p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-[14px] border border-[#DDE7F0] bg-[#F5F8FB] text-[#1F3A5F]">
          <Activity className="size-5" />
        </span>
      </div>
      <dl className="mt-5 space-y-3 text-sm">
        <StatusRow label="مرحله جاری" value={currentStage} />
        <StatusRow label="آخرین تغییر" value={lastUpdated} />
      </dl>
    </Card>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E8EEF4] bg-[#FBFCFD] px-3.5 py-3">
      <dt className="text-[#6B7280]">{label}</dt>
      <dd className="font-medium text-[#102034]">{value}</dd>
    </div>
  );
}
