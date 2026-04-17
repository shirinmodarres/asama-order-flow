"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { ConfirmationModal } from "@/components/manager/confirmation-modal";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { DeliveryConfirmationCard } from "@/components/warehouse/delivery-confirmation-card";
import { SlipDetailsCard } from "@/components/warehouse/slip-details-card";
import { WarehouseStatusBadge } from "@/components/warehouse/warehouse-status-badge";
import { formatNumber } from "@/lib/expert/utils";

interface SlipItemRow {
  id: string;
  name: string;
  brand: string;
  quantity: number;
}

export default function ExitSlipDetailsPage() {
  const params = useParams<{ id: string }>();
  const {
    getExitSlipById,
    getOrderById,
    getProductById,
    confirmExitSlipDelivery,
  } = useExpertStore();
  const slip = getExitSlipById(params.id);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState("");

  if (!slip) {
    return (
      <DashboardLayout role="warehouse" title="جزئیات حواله">
        <EmptyState
          title="حواله خروج یافت نشد"
          description="شناسه حواله معتبر نیست یا وجود ندارد."
        />
      </DashboardLayout>
    );
  }

  const order = getOrderById(slip.orderId);
  if (!order) {
    return (
      <DashboardLayout role="warehouse" title="جزئیات حواله">
        <EmptyState
          title="سفارش مرتبط یافت نشد"
          description="اطلاعات سفارش مرتبط با این حواله در دسترس نیست."
        />
      </DashboardLayout>
    );
  }

  const rows: SlipItemRow[] = order.items.map((item) => {
    const product = getProductById(item.productId);
    return {
      id: item.productId,
      name: product?.name ?? "کالای نامشخص",
      brand: product?.brand ?? "-",
      quantity: item.quantity,
    };
  });

  const canConfirm = order.warehouseStatus === "dispatchIssued";

  const columns: DataTableColumn<SlipItemRow>[] = [
    {
      key: "name",
      header: "قلم کالا",
      render: (row) => (
        <span className="font-medium text-[#1F3A5F]">{row.name}</span>
      ),
    },
    { key: "brand", header: "برند", render: (row) => row.brand },
    {
      key: "qty",
      header: "تعداد",
      render: (row) => formatNumber(row.quantity),
    },
  ];

  const onConfirmDelivery = () => {
    const result = confirmExitSlipDelivery(slip.id);

    if (!result.ok) {
      setMessage(result.error ?? "تایید تحویل انجام نشد.");
      setConfirmOpen(false);
      return;
    }

    setMessage(result.message ?? "تحویل تایید شد.");
    setConfirmOpen(false);
  };

  return (
    <DashboardLayout role="warehouse" title="جزئیات حواله خروج">
      <SectionHeader
        title={`حواله ${slip.slipNumber}`}
        description="نمای کامل حواله خروج و وضعیت تحویل سفارش"
        actions={
          <Link
            href="/warehouse/exit-slips"
            className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm text-[#334155] hover:border-[#CBD5E1]"
          >
            بازگشت به لیست
          </Link>
        }
      />

      {message ? (
        <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-3 text-sm text-[#4D7D54]">
          {message}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <SlipDetailsCard
            slipNumber={slip.slipNumber}
            orderCode={order.code}
            exitDate={slip.exitDate}
            createdBy={slip.createdBy}
            createdAt={slip.createdAt}
            deliveredAt={slip.deliveredAt}
            notes={slip.notes}
          />

          <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-[#1F3A5F]">
              وضعیت فعلی سفارش
            </h3>
            <div className="mt-4">
              <WarehouseStatusBadge status={order.warehouseStatus} />
            </div>
          </div>

          <DeliveryConfirmationCard
            disabled={!canConfirm}
            onConfirm={() => setConfirmOpen(true)}
          />
        </div>
      </section>

      <ConfirmationModal
        open={confirmOpen}
        title="تایید تحویل به مشتری"
        message="با ثبت این عملیات، وضعیت انبار سفارش به تایید تحویل به مشتری تغییر می کند."
        confirmText="تایید نهایی"
        tone="success"
        onConfirm={onConfirmDelivery}
        onCancel={() => setConfirmOpen(false)}
      />
    </DashboardLayout>
  );
}
