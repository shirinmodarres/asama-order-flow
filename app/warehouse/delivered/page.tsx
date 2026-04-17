"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { WarehouseStatusBadge } from "@/components/warehouse/warehouse-status-badge";
import type { ExpertOrder } from "@/lib/expert/types";
import { formatDate } from "@/lib/expert/utils";

interface DeliveredRow {
  order: ExpertOrder;
  slipNumber: string;
  deliveredAt: string;
}

export default function WarehouseDeliveredPage() {
  const { orders, getExitSlipByOrderId } = useExpertStore();

  const rows = useMemo(() => {
    return orders
      .filter((order) => order.warehouseStatus === "delivered")
      .map((order) => {
        const slip = getExitSlipByOrderId(order.id);
        return {
          order,
          slipNumber: slip?.slipNumber ?? "-",
          deliveredAt: slip?.deliveredAt ?? order.updatedAt,
        } as DeliveredRow;
      })
      .sort((a, b) => Number(new Date(b.deliveredAt)) - Number(new Date(a.deliveredAt)));
  }, [getExitSlipByOrderId, orders]);

  const columns: DataTableColumn<DeliveredRow>[] = [
    { key: "code", header: "کد سفارش", render: (row) => <span className="font-semibold text-[#1F3A5F]">{row.order.code}</span> },
    { key: "slip", header: "شماره حواله", render: (row) => row.slipNumber },
    { key: "delivery-date", header: "تاریخ تحویل", render: (row) => formatDate(row.deliveredAt) },
    { key: "order-status", header: "وضعیت سفارش", render: (row) => <StatusBadge type="order" status={row.order.status} /> },
    { key: "warehouse-status", header: "وضعیت انبار", render: (row) => <WarehouseStatusBadge status={row.order.warehouseStatus} /> },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => {
        const slip = getExitSlipByOrderId(row.order.id);
        if (!slip) return <span className="text-xs text-[#94A3B8]">جزئیات حواله موجود نیست</span>;

        return (
          <Link
            href={`/warehouse/exit-slips/${slip.id}`}
            className="rounded-[12px] border border-[#E5E7EB] px-3 py-1.5 text-xs text-[#334155]"
          >
            مشاهده جزئیات
          </Link>
        );
      },
    },
  ];

  return (
    <DashboardLayout role="warehouse" title="سفارش های تحویل شده">
      <SectionHeader title="تحویل های نهایی شده" description="سفارش هایی که تحویل به مشتری برای آن ها تایید شده است" />

      {rows.length > 0 ? (
        <DataTable columns={columns} rows={rows} rowKey={(row) => row.order.id} />
      ) : (
        <EmptyState title="تحویلی ثبت نشده" description="هنوز هیچ سفارش تحویل شده ای ثبت نشده است." />
      )}
    </DashboardLayout>
  );
}
