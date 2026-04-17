"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { ApprovalActionsCard } from "@/components/manager/approval-actions-card";
import { ConfirmationModal } from "@/components/manager/confirmation-modal";
import { ProcessStatusCard } from "@/components/manager/process-status-card";
import { ProgressTimeline } from "@/components/manager/progress-timeline";
import { ReserveInventoryNote } from "@/components/manager/reserve-inventory-note";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderSummaryCard } from "@/components/shared/order-summary-card";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { getOrderLastStageLabel } from "@/lib/expert/mock-data";
import {
  formatDate,
  formatNumber,
  getAvailableStock,
  getOrderItemCount,
  getOrderTotalQuantity,
} from "@/lib/expert/utils";

type DecisionType = "approve" | "cancel" | null;

interface InventoryRow {
  id: string;
  name: string;
  brand: string;
  requested: number;
  total: number;
  reserved: number;
  available: number;
}

export default function ManagerOrderReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getOrderById, getProductById, approveOrder, cancelOrder } =
    useExpertStore();
  const order = getOrderById(params.id);

  const [decision, setDecision] = useState<DecisionType>(null);
  const [message, setMessage] = useState("");

  const inventoryRows: InventoryRow[] = useMemo(() => {
    if (!order) return [];

    return order.items.map((item) => {
      const product = getProductById(item.productId);
      return {
        id: item.productId,
        name: product?.name ?? "کالای نامشخص",
        brand: product?.brand ?? "-",
        requested: item.quantity,
        total: product?.totalStock ?? 0,
        reserved: product?.reservedStock ?? 0,
        available: product ? getAvailableStock(product) : 0,
      };
    });
  }, [getProductById, order]);

  if (!order) {
    return (
      <DashboardLayout role="manager" title="بررسی سفارش">
        <EmptyState
          title="سفارش یافت نشد"
          description="شناسه سفارش معتبر نیست یا در داده های نمونه وجود ندارد."
        />
      </DashboardLayout>
    );
  }

  const isPending = order.status === "pending";
  const disableReason = isPending
    ? ""
    : "این سفارش قبلا تعیین تکلیف شده و دیگر قابل تصمیم گیری نیست.";

  const columns: DataTableColumn<InventoryRow>[] = [
    {
      key: "name",
      header: "نام کالا",
      render: (row) => (
        <span className="font-medium text-[#1F3A5F]">{row.name}</span>
      ),
    },
    { key: "brand", header: "برند", render: (row) => row.brand },
    {
      key: "requested",
      header: "تعداد درخواست",
      render: (row) => formatNumber(row.requested),
    },
    {
      key: "total",
      header: "موجودی کل",
      render: (row) => formatNumber(row.total),
    },
    {
      key: "reserved",
      header: "موجودی رزروشده",
      render: (row) => formatNumber(row.reserved),
    },
    {
      key: "available",
      header: "موجودی قابل استفاده",
      render: (row) => formatNumber(row.available),
    },
  ];

  const confirmDecision = () => {
    if (!decision) return;

    const result =
      decision === "approve" ? approveOrder(order.id) : cancelOrder(order.id);

    if (!result.ok) {
      setMessage(result.error ?? "انجام عملیات ممکن نبود.");
      setDecision(null);
      return;
    }

    setMessage(result.message ?? "عملیات با موفقیت انجام شد.");
    setDecision(null);

    setTimeout(() => {
      router.push("/manager/order-tracking");
    }, 700);
  };

  return (
    <DashboardLayout role="manager" title="بررسی سفارش">
      <SectionHeader
        title={`بررسی ${order.code}`}
        description="ثبت تصمیم نهایی مدیر فروش برای شروع یا توقف فرآیند انبار"
        actions={
          <Link
            href="/manager/pending-orders"
            className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm text-[#334155] hover:border-[#CBD5E1]"
          >
            بازگشت به لیست
          </Link>
        }
      />

      {message ? (
        <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-3 text-sm text-[#1D4ED8]">
          {message}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-[#1F3A5F]">
              مشخصات سفارش
            </h3>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoItem label="کد سفارش" value={order.code} />
              <InfoItem label="ثبت کننده" value={order.createdBy} />
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
                value={formatDate(order.updatedAt)}
              />
            </dl>
          </div>

          <ReserveInventoryNote />

          <div>
            <DataTable
              columns={columns}
              rows={inventoryRows}
              rowKey={(row) => row.id}
            />
          </div>

          <ProgressTimeline order={order} />
        </div>

        <div className="space-y-4">
          <OrderSummaryCard
            itemCount={getOrderItemCount(order.items)}
            totalQuantity={getOrderTotalQuantity(order.items)}
            status={order.status}
            warehouseStatus={order.warehouseStatus}
          />

          <ProcessStatusCard
            currentStage={getOrderLastStageLabel(order)}
            lastUpdated={formatDate(order.updatedAt)}
          />

          <ApprovalActionsCard
            disabled={!isPending}
            disableReason={disableReason}
            onApprove={() => setDecision("approve")}
            onCancel={() => setDecision("cancel")}
          />
        </div>
      </section>

      <ConfirmationModal
        open={decision !== null}
        title={decision === "approve" ? "تایید سفارش" : "لغو سفارش"}
        message={
          decision === "approve"
            ? "با تایید، وضعیت سفارش به تایید شده و وضعیت انبار به در بررسی انبار تغییر می کند."
            : "با لغو، وضعیت سفارش لغو شده و رزرو موجودی به انبار بازگردانده می شود."
        }
        confirmText={decision === "approve" ? "تایید نهایی" : "لغو نهایی"}
        tone={decision === "approve" ? "success" : "danger"}
        onConfirm={confirmDecision}
        onCancel={() => setDecision(null)}
      />
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
