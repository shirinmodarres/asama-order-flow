"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import type { ExpertOrder } from "@/lib/expert/types";
import { formatDate } from "@/lib/expert/utils";

export default function NajaOrdersPage() {
  const { orders } = useExpertStore();
  const [search, setSearch] = useState("");

  const rows = useMemo(
    () =>
      orders
        .filter((order) => order.orderSource === "naja")
        .filter((order) => {
          const query = search.toLowerCase().trim();
          if (!query) return true;
          return (
            order.code.toLowerCase().includes(query) ||
            order.customerName.toLowerCase().includes(query) ||
            (order.nationalId ?? "").toLowerCase().includes(query) ||
            (order.phoneNumber ?? "").toLowerCase().includes(query)
          );
        })
        .sort(
          (a, b) =>
            Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt)),
        ),
    [orders, search],
  );

  const columns: DataTableColumn<ExpertOrder>[] = [
    {
      key: "code",
      header: "کد سفارش",
      render: (row) => (
        <span className="font-semibold text-[#1F3A5F]">{row.code}</span>
      ),
    },
    { key: "customer", header: "نام مشتری", render: (row) => row.customerName },

    {
      key: "orderStatus",
      header: "وضعیت سفارش",
      render: (row) => <StatusBadge type="order" status={row.status} />,
    },
    {
      key: "warehouseStatus",
      header: "وضعیت انبار",
      render: (row) => (
        <StatusBadge type="warehouse" status={row.warehouseStatus} />
      ),
    },
    {
      key: "updatedAt",
      header: "آخرین تغییر",
      render: (row) => formatDate(row.updatedAt),
    },
    {
      key: "actions",
      header: "عملیات",
      sticky: "left",
      headerClassName: "min-w-[150px]",
      cellClassName: "min-w-[150px]",
      render: (row) => (
        <Link
          href={`/naja/orders/${row.id}`}
          className="rounded-xl border border-[#E5E7EB] px-3 py-1.5 text-xs text-[#334155]"
        >
          مشاهده جزئیات
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout role="naja" title="سفارش های ناجا">
      <section className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 right-3.5 z-10 size-4 -translate-y-1/2 text-[#6CAE75]" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجو بر اساس کد سفارش، مشتری، کد ملی یا موبایل"
            className="pr-10"
          />
        </div>
      </section>

      {rows.length > 0 ? (
        <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} />
      ) : (
        <EmptyState
          title="سفارش ناجایی یافت نشد"
          description="فیلتر را تغییر دهید یا سفارش جدید ثبت کنید."
        />
      )}
    </DashboardLayout>
  );
}
