import { orderStatusLabel, warehouseStatusLabel } from "@/lib/expert/mock-data";
import type { OrderStatus, WarehouseStatus } from "@/lib/expert/types";
import { formatNumber } from "@/lib/expert/utils";

interface OrderSummaryCardProps {
  itemCount: number;
  totalQuantity: number;
  status: OrderStatus;
  warehouseStatus: WarehouseStatus;
}

export function OrderSummaryCard({ itemCount, totalQuantity, status, warehouseStatus }: OrderSummaryCardProps) {
  return (
    <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <h3 className="text-base font-semibold text-[#1F3A5F]">خلاصه سفارش</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-[#6B7280]">تعداد آیتم</dt>
          <dd className="font-semibold text-[#1F3A5F]">{formatNumber(itemCount)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[#6B7280]">جمع تعداد</dt>
          <dd className="font-semibold text-[#1F3A5F]">{formatNumber(totalQuantity)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[#6B7280]">وضعیت سفارش</dt>
          <dd className="font-semibold text-[#334155]">{orderStatusLabel[status]}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[#6B7280]">وضعیت انبار</dt>
          <dd className="font-semibold text-[#334155]">{warehouseStatusLabel[warehouseStatus]}</dd>
        </div>
      </dl>
    </div>
  );
}
