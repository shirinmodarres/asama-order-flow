"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { NajaOrderTimeline } from "@/components/naja/naja-order-timeline";
import { NajaReturnAction } from "@/components/naja/naja-return-action";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderSummaryCard } from "@/components/shared/order-summary-card";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  getOrderItemCount,
  getOrderLineTotal,
  getOrderTotalQuantity,
} from "@/lib/expert/utils";
import type { ExpertOrder } from "@/lib/expert/types";

interface OrderDetailRow {
  id: string;
  name: string;
  brand: string;
  unit: string;
  unitPrice: number;
  quantity: number;
}

export default function NajaOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const { getOrderById, getProductById, getInvoiceByOrderId } =
    useExpertStore();
  const order = getOrderById(params.id);

  if (!order || order.orderSource !== "naja") {
    return (
      <DashboardLayout role="naja" title="جزئیات سفارش ناجا">
        <EmptyState
          title="سفارش ناجا یافت نشد"
          description="این شناسه در جریان اختصاصی ناجا وجود ندارد."
        />
      </DashboardLayout>
    );
  }

  const invoice = getInvoiceByOrderId(order.id);
  const detailRows: OrderDetailRow[] = order.items.map((item) => {
    const product = getProductById(item.productId);
    return {
      id: item.productId,
      name: product?.name ?? "کالای نامشخص",
      brand: product?.brand ?? "-",
      unit: product?.unit ?? "-",
      unitPrice: product?.unitPrice ?? 0,
      quantity: item.quantity,
    };
  });
  const totalAmount = detailRows.reduce(
    (sum, row) => sum + getOrderLineTotal(row.quantity, row.unitPrice),
    0,
  );

  const columns: DataTableColumn<OrderDetailRow>[] = [
    {
      key: "name",
      header: "نام کالا",
      render: (row) => (
        <span className="font-medium text-[#1F3A5F]">{row.name}</span>
      ),
    },
    { key: "brand", header: "برند", render: (row) => row.brand },
    { key: "unit", header: "واحد", render: (row) => row.unit },
    {
      key: "unitPrice",
      header: "قیمت واحد",
      render: (row) => formatCurrency(row.unitPrice),
    },
    {
      key: "quantity",
      header: "تعداد",
      render: (row) => formatNumber(row.quantity),
    },
    {
      key: "lineTotal",
      header: "مبلغ",
      render: (row) =>
        formatCurrency(getOrderLineTotal(row.quantity, row.unitPrice)),
    },
  ];

  return (
    <DashboardLayout role="naja" title="جزئیات سفارش ناجا">
      <SectionHeader
        title={`سفارش ${order.code}`}
        description="مشاهده اطلاعات مشتری، وضعیت انبار، فاکتور و سوابق بازگردانی سفارش ناجا"
        actions={
          <Link
            href="/naja/orders"
            className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm text-[#334155]"
          >
            بازگشت به لیست
          </Link>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-[#1F3A5F]">
              اطلاعات سفارش ناجا
            </h3>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoItem label="کد سفارش" value={order.code} />

              <InfoItem label="ثبت کننده" value={order.createdBy} />
              <InfoItem label="نام مشتری" value={order.customerName} />
              <InfoItem label="کد ملی" value={order.nationalId ?? "-"} />
              <InfoItem label="شماره موبایل" value={order.phoneNumber ?? "-"} />
              <InfoItem label="تاریخ ثبت" value={formatDate(order.createdAt)} />
              <InfoItem
                label="وضعیت سفارش"
                value={<StatusBadge type="order" status={order.status} />}
              />
              <InfoItem
                label="وضعیت انبار"
                value={
                  <StatusBadge
                    type="warehouse"
                    status={order.warehouseStatus}
                  />
                }
              />

              <InfoItem
                label="آخرین تغییر"
                value={formatDateTime(order.updatedAt)}
              />
              {order.productIdentifier ? (
                <InfoItem label="شناسه کالا" value={order.productIdentifier} />
              ) : null}
              {order.trackingCode ? (
                <InfoItem label="کد رهگیری" value={order.trackingCode} />
              ) : null}
              <InfoItem
                label="وضعیت فاکتور"
                value={
                  invoice
                    ? `صادر شده - ${invoice.invoiceNumber}`
                    : "هنوز صادر نشده"
                }
              />
            </dl>
          </div>

          <DataTable
            columns={columns}
            rows={detailRows}
            rowKey={(row) => row.id}
          />

          <NajaOrderTimeline order={order} />
        </div>

        <div className="space-y-4">
          <OrderSummaryCard
            customerName={order.customerName}
            itemCount={getOrderItemCount(order.items)}
            totalQuantity={getOrderTotalQuantity(order.items)}
            totalAmount={totalAmount}
            status={order.status}
            warehouseStatus={order.warehouseStatus}
          />

          <NajaReturnAction
            order={order as ExpertOrder}
            actorName="کارشناس مرادی"
          />
        </div>
      </section>
    </DashboardLayout>
  );
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#FBFCFD] p-3">
      <dt className="text-xs text-[#6B7280]">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[#1F3A5F]">{value}</dd>
    </div>
  );
}
