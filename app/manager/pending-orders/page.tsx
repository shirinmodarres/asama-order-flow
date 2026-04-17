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
import { orderStatusLabel } from "@/lib/expert/mock-data";
import type { ExpertOrder, OrderStatus } from "@/lib/expert/types";
import {
  formatDate,
  formatNumber,
  getOrderItemCount,
} from "@/lib/expert/utils";

export default function ManagerPendingOrdersPage() {
  const { orders } = useExpertStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "all" | OrderStatus
  >("pending");

  const filteredOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)),
      )
      .filter((order) => {
        const matchesSearch =
          order.code.toLowerCase().includes(search.toLowerCase()) ||
          order.createdBy.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
          statusFilter === "all" ? true : order.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
  }, [orders, search, statusFilter]);

  const columns: DataTableColumn<ExpertOrder>[] = [
    {
      key: "code",
      header: "کد سفارش",
      render: (row) => (
        <span className="font-semibold text-[#1F3A5F]">{row.code}</span>
      ),
    },
    { key: "creator", header: "ثبت کننده", render: (row) => row.createdBy },
    {
      key: "date",
      header: "تاریخ",
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "items",
      header: "تعداد آیتم",
      render: (row) => formatNumber(getOrderItemCount(row.items)),
    },
    {
      key: "order-status",
      header: "وضعیت سفارش",
      render: (row) => <StatusBadge type="order" status={row.status} />,
    },
    {
      key: "warehouse-status",
      header: "وضعیت انبار",
      render: (row) => (
        <StatusBadge type="warehouse" status={row.warehouseStatus} />
      ),
    },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        <Link
          href={`/manager/orders/${row.id}`}
          className="rounded-xl border border-[#1F3A5F] bg-[#1F3A5F] px-3 py-1.5 text-xs !text-white"
        >
          بررسی سفارش
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout role="manager" title="سفارش های در انتظار تایید">
      <SectionHeader
        title="صف تایید سفارش"
        description="نمایش سفارش هایی که نیاز به تصمیم نهایی مدیر فروش دارند"
      />

      <section className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجو بر اساس کد سفارش یا نام ثبت کننده"
            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#1F3A5F]"
          />
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as "pending" | "all" | OrderStatus,
              )
            }
            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#1F3A5F]"
          >
            <option value="pending">در انتظار تایید</option>
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
        <DataTable
          columns={columns}
          rows={filteredOrders}
          rowKey={(row) => row.id}
        />
      ) : (
        <EmptyState
          title="سفارش در انتظار تایید یافت نشد"
          description="فیلترها را تغییر دهید یا وارد روند سفارش ها شوید."
        />
      )}
    </DashboardLayout>
  );
}
