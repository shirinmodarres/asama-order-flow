"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { getOrderEditBlockReason, orderStatusLabel } from "@/lib/expert/mock-data";
import type { ExpertOrder, OrderStatus } from "@/lib/expert/types";
import { formatDate, formatNumber, getOrderItemCount, isOrderEditable } from "@/lib/expert/utils";

export default function ExpertOrdersPage() {
  const { orders } = useExpertStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  const filteredOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)))
      .filter((order) => {
        const matchesSearch = order.code.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
  }, [orders, search, statusFilter]);

  const columns: DataTableColumn<ExpertOrder>[] = [
    { key: "code", header: "کد سفارش", render: (row) => <span className="font-semibold text-[#1F3A5F]">{row.code}</span> },
    { key: "date", header: "تاریخ", render: (row) => formatDate(row.createdAt) },
    { key: "items", header: "تعداد آیتم", render: (row) => formatNumber(getOrderItemCount(row.items)) },
    { key: "order-status", header: "وضعیت سفارش", render: (row) => <StatusBadge type="order" status={row.status} /> },
    { key: "warehouse-status", header: "وضعیت انبار", render: (row) => <StatusBadge type="warehouse" status={row.warehouseStatus} /> },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => {
        const editable = isOrderEditable(row);
        const reason = getOrderEditBlockReason(row.status);

        return (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/expert/orders/${row.id}`}
              className="rounded-[12px] border border-[#E5E7EB] px-3 py-1.5 text-xs text-[#334155] hover:border-[#CBD5E1]"
            >
              مشاهده جزئیات
            </Link>
            {editable ? (
              <Link
                href={`/expert/orders/${row.id}/edit`}
                className="btn-primary rounded-[12px] px-3 py-1.5 text-sm font-medium text-white visited:text-white hover:text-white focus:text-white"
              >
                ویرایش
              </Link>
            ) : (
              <button
                type="button"
                disabled
                title={reason}
                className="cursor-not-allowed rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-1.5 text-sm text-[#64748B]"
              >
                ویرایش
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout role="expert" title="سفارش های من">
      <SectionHeader
        title="مدیریت سفارش ها"
        description="ثبت، پیگیری و ویرایش سفارش های در انتظار تایید"
        actions={
          <Link
            href="/expert/orders/new"
            className="btn-primary rounded-[12px] px-4 py-2 text-sm font-medium text-white visited:text-white hover:text-white focus:text-white"
          >
            ثبت سفارش جدید
          </Link>
        }
      />

      <section className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجو بر اساس کد سفارش"
            className="w-full rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#1F3A5F]"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | OrderStatus)}
            className="w-full rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#1F3A5F]"
          >
            <option value="all">همه وضعیت ها</option>
            {Object.entries(orderStatusLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {filteredOrders.length > 0 ? (
        <DataTable columns={columns} rows={filteredOrders} rowKey={(row) => row.id} />
      ) : (
        <EmptyState title="سفارشی یافت نشد" description="وضعیت یا عبارت جستجو را تغییر دهید." />
      )}
    </DashboardLayout>
  );
}
