"use client";

interface DeliveryConfirmationCardProps {
  disabled?: boolean;
  onConfirm: () => void;
}

export function DeliveryConfirmationCard({ disabled = false, onConfirm }: DeliveryConfirmationCardProps) {
  return (
    <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-[#1F3A5F]">تایید تحویل به مشتری</h3>
      <p className="mt-2 text-sm text-[#6B7280]">پس از تایید، وضعیت انبار سفارش به «تایید تحویل به مشتری» تغییر می کند.</p>

      <button
        type="button"
        disabled={disabled}
        onClick={onConfirm}
        className="mt-4 rounded-[12px] border border-[#6CAE75] bg-[#6CAE75] px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:border-[#CBD5E1] disabled:bg-[#CBD5E1]"
      >
        تایید تحویل به مشتری
      </button>
    </div>
  );
}
