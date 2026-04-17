import Link from "next/link";

interface WarehouseActionPanelProps {
  orderId: string;
  showIssueSlip: boolean;
}

export function WarehouseActionPanel({
  orderId,
  showIssueSlip,
}: WarehouseActionPanelProps) {
  return (
    <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-[#1F3A5F]">اقدامات انبار</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {showIssueSlip ? (
          <Link
            href={`/warehouse/orders/${orderId}/exit-slip`}
            className="rounded-[12px] border border-[#1F3A5F] bg-[#1F3A5F] px-4 py-2 text-sm !text-white"
          >
            ثبت حواله خروج
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2 text-sm text-[#94A3B8]"
          >
            ثبت حواله خروج
          </button>
        )}
      </div>
      {!showIssueSlip ? (
        <p className="mt-3 text-xs text-[#6B7280]">
          برای این سفارش قبلا حواله خروج صادر شده است.
        </p>
      ) : null}
    </div>
  );
}
