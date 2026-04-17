"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderSummaryCard } from "@/components/shared/order-summary-card";
import { SectionHeader } from "@/components/shared/section-header";
import { WarehouseActionPanel } from "@/components/warehouse/warehouse-action-panel";
import { WarehouseStatusBadge } from "@/components/warehouse/warehouse-status-badge";
import {
  formatDate,
  formatNumber,
  getOrderItemCount,
  getOrderTotalQuantity,
} from "@/lib/expert/utils";

interface ItemRow {
  id: string;
  name: string;
  brand: string;
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
      quantity: item.quantity,
    };
  });

  const columns: DataTableColumn<ItemRow>[] = [
    {
      key: "name",
      header: "نام کالا",
      render: (row) => (
        <span className="font-medium text-[#1F3A5F]">{row.name}</span>
      ),
    },
    { key: "brand", header: "برند", render: (row) => row.brand },
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
        description="مشاهده اقلام تاییدشده برای عملیات خروج از انبار"
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
              <InfoItem label="ثبت کننده" value={order.createdBy} />
              <InfoItem
                label="تاریخ تایید"
                value={formatDate(order.updatedAt)}
              />
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
            itemCount={getOrderItemCount(order.items)}
            totalQuantity={getOrderTotalQuantity(order.items)}
            status={order.status}
            warehouseStatus={order.warehouseStatus}
          />

          <WarehouseActionPanel
            orderId={order.id}
            showIssueSlip={!hasSlip && order.warehouseStatus === "reviewing"}
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
