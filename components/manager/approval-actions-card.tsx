"use client";

import { AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ApprovalActionsCardProps {
  disabled?: boolean;
  disableReason?: string;
  onApprove: () => void;
  onCancel: () => void;
}

export function ApprovalActionsCard({
  disabled = false,
  disableReason,
  onApprove,
  onCancel,
}: ApprovalActionsCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[#102034]">
            اقدامات مدیر فروش
          </h3>
          <p className="mt-2 text-sm leading-7 text-[#6B7280]">
            در این مرحله، مدیر فروش تصمیم نهایی تایید یا لغو سفارش را ثبت می کند.
          </p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-[14px] border border-[#DDE7F0] bg-[#F5F8FB] text-[#1F3A5F]">
          <ShieldCheck className="size-5" />
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="success"
          disabled={disabled}
          onClick={onApprove}
        >
          تایید سفارش
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={disabled}
          onClick={onCancel}
        >
          لغو سفارش
        </Button>
      </div>

      {disabled && disableReason ? (
        <div className="mt-4 flex items-start gap-2 rounded-[16px] border border-[#F0D0D0] bg-[#FFF6F6] px-4 py-3 text-xs leading-6 text-[#9C3B3B]">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{disableReason}</p>
        </div>
      ) : null}
    </Card>
  );
}
