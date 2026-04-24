import { ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FinanceActionPanelProps {
  disabled?: boolean;
  disabledReason?: string;
  onIssueInvoice: () => void;
}

export function FinanceActionPanel({
  disabled = false,
  disabledReason,
  onIssueInvoice,
}: FinanceActionPanelProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[#102034]">اقدام مالی</h3>
          <p className="mt-2 text-sm leading-7 text-[#6B7280]">
            این مرحله تایید می کند کالای تحویل شده، از نظر مالی نهایی و آماده ثبت
            فاکتور داخلی است.
          </p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-[14px] border border-[#DDE7F0] bg-[#F5F8FB] text-[#1F3A5F]">
          <ReceiptText className="size-5" />
        </span>
      </div>

      <Button
        type="button"
        onClick={onIssueInvoice}
        disabled={disabled}
        fullWidth
        className="mt-5"
      >
        صدور فاکتور
      </Button>

      {disabled && disabledReason ? (
        <p className="mt-3 text-xs leading-6 text-[#9C3B3B]">{disabledReason}</p>
      ) : null}
    </Card>
  );
}
