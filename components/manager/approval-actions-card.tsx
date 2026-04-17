"use client";

interface ApprovalActionsCardProps {
  disabled?: boolean;
  disableReason?: string;
  onApprove: () => void;
  onCancel: () => void;
}

export function ApprovalActionsCard({ disabled = false, disableReason, onApprove, onCancel }: ApprovalActionsCardProps) {
  return (
    <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-[#1F3A5F]">اقدامات مدیر فروش</h3>
      <p className="mt-2 text-sm text-[#6B7280]">در این مرحله، مدیر فروش تصمیم نهایی تایید یا لغو سفارش را ثبت می کند.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onApprove}
          className="rounded-[12px] border border-[#6CAE75] bg-[#6CAE75] px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:border-[#CBD5E1] disabled:bg-[#CBD5E1]"
        >
          تایید سفارش
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onCancel}
          className="rounded-[12px] border border-[#B91C1C] bg-[#B91C1C] px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:border-[#CBD5E1] disabled:bg-[#CBD5E1]"
        >
          لغو سفارش
        </button>
      </div>

      {disabled && disableReason ? <p className="mt-3 text-xs text-[#B91C1C]">{disableReason}</p> : null}
    </div>
  );
}
