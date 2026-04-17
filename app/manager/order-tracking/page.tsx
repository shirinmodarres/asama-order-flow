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
import { getOrderLastStageLabel } from "@/lib/expert/mock-data";
import type { ExpertOrder } from "@/lib/expert/types";
import { formatDate } from "@/lib/expert/utils";

type TrackingFilter =
  | "all"
  | "pending"
  | "approved"
  | "cancelled"
  | "dispatchIssued"
  | "delivered"
  | "invoiced";

export default function ManagerOrderTrackingPage() {
  const { orders } = useExpertStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TrackingFilter>("all");

  const filteredOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) => Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt)),
      )
      .filter((order) => {
        const matchesSearch =
          order.code.toLowerCase().includes(search.toLowerCase()) ||
          order.createdBy.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;
        if (filter === "all") return true;
        if (filter === "dispatchIssued")
          return order.warehouseStatus === "dispatchIssued";
        if (filter === "delivered")
          return order.warehouseStatus === "delivered";
        if (filter === "invoiced") return order.status === "invoiced";
        return order.status === filter;
      });
  }, [filter, orders, search]);

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
      key: "stage",
      header: "آخرین مرحله",
      render: (row) => getOrderLastStageLabel(row),
    },
    {
      key: "updated",
      header: "تاریخ آخرین تغییر",
      render: (row) => formatDate(row.updatedAt),
    },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        <Link
          href={`/manager/orders/${row.id}`}
          className="rounded-xl border border-[#E5E7EB] px-3 py-1.5 text-xs text-[#334155]"
        >
          مشاهده جزئیات
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout role="manager" title="روند سفارش ها">
      <SectionHeader
        title="ردیابی فرآیند سفارش"
        description="پایش کامل سفارش ها از مرحله تایید تا فاکتور"
      />

      <section className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجو بر اساس کد سفارش یا ثبت کننده"
            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#1F3A5F]"
          />
          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as TrackingFilter)
            }
            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#1F3A5F]"
          >
            <option value="all">همه وضعیت ها</option>
            <option value="pending">در انتظار تایید</option>
            <option value="approved">تایید شده</option>
            <option value="cancelled">لغو شده</option>
            <option value="dispatchIssued">حواله خروج صادر شد</option>
            <option value="delivered">تایید تحویل به مشتری</option>
            <option value="invoiced">فاکتور شده</option>
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
          title="سفارشی با این فیلتر یافت نشد"
          description="فیلترهای انتخابی را تغییر دهید."
        />
      )}
    </DashboardLayout>
  );
}
