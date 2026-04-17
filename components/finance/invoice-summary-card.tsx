import type { ReactNode } from "react";
import { InvoiceStatusBadge } from "@/components/finance/invoice-status-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Invoice, WarehouseStatus } from "@/lib/expert/types";
import {
  formatDateTime,
  formatNumber,
  getOrderItemCount,
  getOrderTotalQuantity,
} from "@/lib/expert/utils";

interface InvoiceSummaryCardProps {
  invoice?: Invoice;
  warehouseStatus: WarehouseStatus;
}

export function InvoiceSummaryCard({
  invoice,
  warehouseStatus,
}: InvoiceSummaryCardProps) {
  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-[#1F3A5F]">خلاصه مالی</h3>

      {invoice ? (
        <div className="mt-4 space-y-3 text-sm">
          <Row label="شماره فاکتور" value={invoice.invoiceNumber} />
          <Row label="تاریخ صدور" value={formatDateTime(invoice.issuedAt)} />
          <Row
            label="تعداد آیتم"
            value={formatNumber(getOrderItemCount(invoice.items))}
          />
          <Row
            label="جمع تعداد"
            value={formatNumber(getOrderTotalQuantity(invoice.items))}
          />
          <Row
            label="وضعیت فاکتور"
            value={<InvoiceStatusBadge status={invoice.status} />}
          />
          <Row
            label="وضعیت انبار"
            value={<StatusBadge type="warehouse" status={warehouseStatus} />}
          />
        </div>
      ) : (
        <p className="mt-3 text-sm text-[#6B7280]">
          فاکتور برای این سفارش هنوز صادر نشده است.
        </p>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-[#FBFCFD] px-3 py-2">
      <span className="text-[#6B7280]">{label}</span>
      <span className="font-medium text-[#1F3A5F]">{value}</span>
    </div>
  );
}
