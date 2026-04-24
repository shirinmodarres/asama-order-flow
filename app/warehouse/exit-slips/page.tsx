"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { WarehouseStatusBadge } from "@/components/warehouse/warehouse-status-badge";
import type { ExitSlip } from "@/lib/expert/types";
import { formatDate, formatDateTime } from "@/lib/expert/utils";
import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface ExitSlipRow {
  slip: ExitSlip;
  orderCode: string;
  warehouseStatus: "dispatchIssued" | "delivered";
}

export default function WarehouseExitSlipsPage() {
  const { exitSlips, getOrderById } = useExpertStore();
  const [search, setSearch] = useState("");

  const rows: ExitSlipRow[] = useMemo(() => {
    return exitSlips
      .map((slip) => {
        const order = getOrderById(slip.orderId);
        if (!order) return null;

        const warehouseStatus =
          order.warehouseStatus === "delivered"
            ? "delivered"
            : "dispatchIssued";

        return {
          slip,
          orderCode: order.code,
          warehouseStatus,
        } as ExitSlipRow;
      })
      .filter((row): row is ExitSlipRow => Boolean(row))
      .filter((row) => {
        const query = search.toLowerCase();
        return (
          row.slip.slipNumber.toLowerCase().includes(query) ||
          row.orderCode.toLowerCase().includes(query)
        );
      })
      .sort(
        (a, b) =>
          Number(new Date(b.slip.createdAt)) -
          Number(new Date(a.slip.createdAt)),
      );
  }, [exitSlips, getOrderById, search]);

  const columns: DataTableColumn<ExitSlipRow>[] = [
    {
      key: "slip",
      header: "شماره حواله",
      render: (row) => (
        <span className="font-semibold text-[#1F3A5F]">
          {row.slip.slipNumber}
        </span>
      ),
    },
    { key: "order", header: "سفارش مرتبط", render: (row) => row.orderCode },
    {
      key: "exit-date",
      header: "تاریخ خروج",
      render: (row) => formatDate(row.slip.exitDate),
    },
    {
      key: "created-at",
      header: "زمان ثبت",
      render: (row) => formatDateTime(row.slip.createdAt),
    },
    {
      key: "status",
      header: "وضعیت فعلی",
      render: (row) => <WarehouseStatusBadge status={row.warehouseStatus} />,
    },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        <Link
          href={`/warehouse/exit-slips/${row.slip.id}`}
          className="rounded-xl border border-[#E5E7EB] px-3 py-1.5 text-xs text-[#334155]"
        >
          مشاهده جزئیات
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout role="warehouse" title="حواله های خروج">
      <section className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 right-3.5 z-10 size-4 -translate-y-1/2 text-[#6CAE75]" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجو بر اساس شماره حواله یا کد سفارش"
            className="pr-10"
          />
        </div>
      </section>

      {rows.length > 0 ? (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.slip.id}
        />
      ) : (
        <EmptyState
          title="حواله خروجی ثبت نشده"
          description="هنوز حواله خروجی برای سفارش ها ثبت نشده است."
        />
      )}
    </DashboardLayout>
  );
}
