import type { ReactNode } from "react";
import { ReconciliationCard } from "@/components/finance/reconciliation-card";
import { StatusBadge } from "@/components/shared/status-badge";
import type { ExitSlip, ExpertOrder, Product } from "@/lib/expert/types";
import { formatDate, formatDateTime, formatNumber, getOrderItemCount, getOrderTotalQuantity } from "@/lib/expert/utils";

interface OrderVsSlipComparisonProps {
  order: ExpertOrder;
  slip: ExitSlip;
  productsById: Record<string, Product | undefined>;
}

export function OrderVsSlipComparison({ order, slip, productsById }: OrderVsSlipComparisonProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <ReconciliationCard title="اطلاعات سفارش" subtitle="جزئیات ثبت و تایید سفارش">
        <dl className="grid gap-3 sm:grid-cols-2">
          <InfoItem label="کد سفارش" value={order.code} />
          <InfoItem label="ثبت کننده" value={order.createdBy} />
          <InfoItem label="تاریخ ثبت" value={formatDate(order.createdAt)} />
          <InfoItem label="تاریخ آخرین تغییر" value={formatDate(order.updatedAt)} />
          <InfoItem label="وضعیت سفارش" value={<StatusBadge type="order" status={order.status} />} />
          <InfoItem label="تعداد اقلام" value={formatNumber(getOrderItemCount(order.items))} />
          <InfoItem label="جمع تعداد درخواستی" value={formatNumber(getOrderTotalQuantity(order.items))} />
        </dl>

        <ul className="mt-4 space-y-2">
          {order.items.map((item) => (
            <li key={item.productId} className="flex items-center justify-between rounded-[12px] border border-[#E5E7EB] bg-[#FBFCFD] px-3 py-2 text-sm">
              <span className="text-[#334155]">{productsById[item.productId]?.name ?? "کالای نامشخص"}</span>
              <span className="font-medium text-[#1F3A5F]">{formatNumber(item.quantity)}</span>
            </li>
          ))}
        </ul>
      </ReconciliationCard>

      <ReconciliationCard title="اطلاعات حواله و تحویل" subtitle="مبنای تطبیق مالی پیش از صدور فاکتور">
        <dl className="grid gap-3 sm:grid-cols-2">
          <InfoItem label="شماره حواله خروج" value={slip.slipNumber} />
          <InfoItem label="مسئول ثبت" value={slip.createdBy} />
          <InfoItem label="تاریخ خروج" value={formatDate(slip.exitDate)} />
          <InfoItem label="تاریخ تایید تحویل" value={slip.deliveredAt ? formatDateTime(slip.deliveredAt) : "-"} />
          <InfoItem label="وضعیت انبار" value={<StatusBadge type="warehouse" status={order.warehouseStatus} />} />
          <InfoItem label="اقلام تحویل شده" value={formatNumber(getOrderItemCount(order.items))} />
        </dl>

        <p className="mt-4 rounded-[12px] border border-[#E5E7EB] bg-[#FBFCFD] p-3 text-sm text-[#475569]">{slip.notes || "توضیحی ثبت نشده است."}</p>
      </ReconciliationCard>
    </section>
  );
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[#E5E7EB] bg-[#FBFCFD] p-3">
      <dt className="text-xs text-[#6B7280]">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[#1F3A5F]">{value}</dd>
    </div>
  );
}
