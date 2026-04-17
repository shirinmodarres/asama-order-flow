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
import { OrderTimeline } from "@/components/shared/order-timeline";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  getOrderEditBlockReason,
  orderStatusLabel,
  warehouseStatusLabel,
} from "@/lib/expert/mock-data";
import {
  formatDate,
  formatNumber,
  getOrderItemCount,
  getOrderTotalQuantity,
  isOrderEditable,
} from "@/lib/expert/utils";

interface OrderDetailRow {
  id: string;
  name: string;
  brand: string;
  quantity: number;
}

export default function ExpertOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const { getOrderById, getProductById } = useExpertStore();
  const order = getOrderById(params.id);

  if (!order) {
    return (
      <DashboardLayout role="expert" title="جزئیات سفارش">
        <EmptyState
          title="سفارش یافت نشد"
          description="شناسه سفارش نامعتبر است یا این سفارش در داده های نمونه وجود ندارد."
        />
      </DashboardLayout>
    );
  }

  const detailRows: OrderDetailRow[] = order.items.map((item) => {
    const product = getProductById(item.productId);
    return {
      id: item.productId,
      name: product?.name ?? "کالای نامشخص",
      brand: product?.brand ?? "-",
      quantity: item.quantity,
    };
  });

  const editable = isOrderEditable(order);
  const blockReason = getOrderEditBlockReason(order.status);

  const columns: DataTableColumn<OrderDetailRow>[] = [
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
      header: "تعداد",
      render: (row) => formatNumber(row.quantity),
    },
  ];

  return (
    <DashboardLayout role="expert" title="جزئیات سفارش">
      <SectionHeader
        title={`سفارش ${order.code}`}
        description="جزئیات وضعیت سفارش، انبار و اقلام ثبت شده"
        actions={
          editable ? (
            <Link
              href={`/expert/orders/${order.id}/edit`}
              className="btn-primary rounded-xl px-4 py-2 text-sm font-medium text-white visited:text-white hover:text-white focus:text-white"
            >
              ویرایش سفارش
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2 text-sm text-[#94A3B8]"
              title={blockReason}
            >
              غیرقابل ویرایش
            </button>
          )
        }
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-[#1F3A5F]">
              اطلاعات سفارش
            </h3>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoItem label="کد سفارش" value={order.code} />
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
            </dl>
          </div>

          <div>
            <DataTable
              columns={columns}
              rows={detailRows}
              rowKey={(row) => row.id}
            />
          </div>

          <OrderTimeline status={order.status} />
        </div>

        <div className="space-y-4">
          <OrderSummaryCard
            itemCount={getOrderItemCount(order.items)}
            totalQuantity={getOrderTotalQuantity(order.items)}
            status={order.status}
            warehouseStatus={order.warehouseStatus}
          />

          {!editable ? (
            <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]">
              {blockReason}
            </div>
          ) : null}

          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#475569] shadow-sm">
            <p className="font-semibold text-[#1F3A5F]">وضعیت های جاری</p>
            <p className="mt-2">
              وضعیت سفارش: {orderStatusLabel[order.status]}
            </p>
            <p className="mt-1">
              وضعیت انبار: {warehouseStatusLabel[order.warehouseStatus]}
            </p>
          </div>
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
