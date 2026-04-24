"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { ExitSlipForm } from "@/components/warehouse/exit-slip-form";
import { ExitSlipSummaryCard } from "@/components/warehouse/exit-slip-summary-card";
import { WarehouseStatusBadge } from "@/components/warehouse/warehouse-status-badge";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderSummaryCard } from "@/components/shared/order-summary-card";
import { SectionHeader } from "@/components/shared/section-header";
import type { CreateExitSlipInput } from "@/lib/expert/types";
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

export default function ExitSlipCreatePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getOrderById, getProductById, getExitSlipByOrderId, createExitSlip } =
    useExpertStore();
  const order = getOrderById(params.id);
  const existingSlip = order ? getExitSlipByOrderId(order.id) : undefined;
  const [message, setMessage] = useState("");

  if (!order) {
    return (
      <DashboardLayout role="warehouse" title="صدور حواله خروج">
        <EmptyState
          title="سفارش یافت نشد"
          description="شناسه سفارش معتبر نیست یا در داده های نمونه وجود ندارد."
        />
      </DashboardLayout>
    );
  }

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

  const handleSubmit = (input: CreateExitSlipInput) => {
    const result = createExitSlip(input);

    if (!result.ok || !result.slip) {
      setMessage(result.error ?? "صدور حواله انجام نشد.");
      return;
    }

    setMessage(result.message ?? "حواله با موفقیت صادر شد.");
    router.push(`/warehouse/exit-slips/${result.slip.id}`);
  };

  return (
    <DashboardLayout role="warehouse" title="صدور حواله خروج">
      <SectionHeader
        title={`صدور حواله برای ${order.code}`}
        description="ثبت حواله خروج، شروع خروج فیزیکی کالا از انبار است."
        actions={
          <Link
            href={`/warehouse/orders/${order.id}`}
            className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm text-[#334155] hover:border-[#CBD5E1]"
          >
            بازگشت
          </Link>
        }
      />

      {message ? (
        <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-3 text-sm text-[#1D4ED8]">
          {message}
        </div>
      ) : null}

      {existingSlip ? (
        <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-4 text-sm text-[#92400E]">
          برای این سفارش قبلا حواله صادر شده است.
          <Link
            href={`/warehouse/exit-slips/${existingSlip.id}`}
            className="mr-1 font-semibold underline"
          >
            مشاهده حواله
          </Link>
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <dl className="grid gap-3 sm:grid-cols-2">
              <InfoItem label="کد سفارش" value={order.code} />
              <InfoItem label="مشتری" value={order.customerName} />
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

          {!existingSlip ? (
            <ExitSlipForm orderId={order.id} onSubmit={handleSubmit} />
          ) : null}
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

          {existingSlip ? (
            <ExitSlipSummaryCard
              slipNumber={existingSlip.slipNumber}
              exitDate={existingSlip.exitDate}
              createdBy={existingSlip.createdBy}
            />
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
