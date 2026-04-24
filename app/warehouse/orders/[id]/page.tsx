"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderSourceBadge } from "@/components/shared/order-source-badge";
import { OrderSummaryCard } from "@/components/shared/order-summary-card";
import { SectionHeader } from "@/components/shared/section-header";
import { WarehouseActionPanel } from "@/components/warehouse/warehouse-action-panel";
import { WarehouseStatusBadge } from "@/components/warehouse/warehouse-status-badge";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  getOrderItemCount,
  getOrderLineTotal,
  getOrderTotalQuantity,
} from "@/lib/expert/utils";

interface ItemRow {
  id: string;
  name: string;
  brand: string;
  unit: string;
  unitPrice: number;
  quantity: number;
}

export default function WarehouseOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const { getOrderById, getProductById, getExitSlipByOrderId } =
    useExpertStore();
  const order = getOrderById(params.id);

  if (!order) {
    return (
      <DashboardLayout role="warehouse" title="جزئیات سفارش">
        <EmptyState
          title="سفارش یافت نشد"
          description="شناسه سفارش معتبر نیست یا در داده های نمونه وجود ندارد."
        />
      </DashboardLayout>
    );
  }

  const hasSlip = Boolean(getExitSlipByOrderId(order.id));
  const rows: ItemRow[] = order.items.map((item) => {
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
  const totalAmount = rows.reduce(
    (sum, row) => sum + getOrderLineTotal(row.quantity, row.unitPrice),
    0,
  );

  const columns: DataTableColumn<ItemRow>[] = [
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
      header: "تعداد تاییدشده",
      render: (row) => formatNumber(row.quantity),
    },
  ];

  return (
    <DashboardLayout role="warehouse" title="جزئیات سفارش انبار">
      <SectionHeader
        title={`سفارش ${order.code}`}
        description={
          order.orderSource === "naja"
            ? "مشاهده سفارش ناجا و وضعیت تکمیل شناسه کالا و کد رهگیری"
            : "مشاهده اقلام تاییدشده برای عملیات خروج از انبار"
        }
        actions={
          <Link
            href="/warehouse/orders"
            className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm text-[#334155] hover:border-[#CBD5E1]"
          >
            بازگشت به لیست
          </Link>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <dl className="grid gap-3 sm:grid-cols-2">
              <InfoItem
                label="منبع سفارش"
                value={<OrderSourceBadge source={order.orderSource} />}
              />
              <InfoItem label="مشتری" value={order.customerName} />
              <InfoItem label="ثبت کننده" value={order.createdBy} />
              {order.najaExpertName ? (
                <InfoItem label="کارشناس ناجا" value={order.najaExpertName} />
              ) : null}
              <InfoItem
                label="تاریخ تایید"
                value={formatDate(order.updatedAt)}
              />
              {order.productIdentifier ? (
                <InfoItem label="شناسه کالا" value={order.productIdentifier} />
              ) : null}
              {order.trackingCode ? (
                <InfoItem label="کد رهگیری" value={order.trackingCode} />
              ) : null}
              <InfoItem
                label="وضعیت انبار"
                value={<WarehouseStatusBadge status={order.warehouseStatus} />}
              />
            </dl>
          </div>

          <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} />
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

          <WarehouseActionPanel
            orderId={order.id}
            showIssueSlip={
              order.orderSource === "normal" &&
              !hasSlip &&
              order.warehouseStatus === "reviewing"
            }
          />
          {order.orderSource === "naja" && order.warehouseStatus === "awaitingNajaDetails" ? (
            <Link
              href={`/warehouse/orders/${order.id}/naja-details`}
              className="btn-primary block rounded-xl px-4 py-3 text-center text-sm font-medium text-white visited:text-white hover:text-white focus:text-white"
            >
              تکمیل شناسه کالا و کد رهگیری
            </Link>
          ) : null}
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
