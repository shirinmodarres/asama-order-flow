"use client";

import { ListFilter, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
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
          order.createdBy.toLowerCase().includes(search.toLowerCase()) ||
          order.customerName.toLowerCase().includes(search.toLowerCase());

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
    { key: "customer", header: "مشتری", render: (row) => row.customerName },
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
      <section className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 right-3.5 z-10 size-4 -translate-y-1/2 text-[#6CAE75]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجو بر اساس کد سفارش، مشتری یا ثبت کننده"
              className="pr-10"
            />
          </div>
          <div className="relative">
            <ListFilter className="pointer-events-none absolute top-1/2 right-3.5 z-10 size-4 -translate-y-1/2 text-[#6CAE75]" />
            <SearchableSelect
              value={filter}
              onValueChange={(value) => setFilter(value as TrackingFilter)}
              options={[
                { value: "all", label: "همه وضعیت ها" },
                { value: "pending", label: "در انتظار تایید" },
                { value: "approved", label: "تایید شده" },
                { value: "cancelled", label: "لغو شده" },
                { value: "dispatchIssued", label: "حواله خروج صادر شد" },
                { value: "delivered", label: "تایید تحویل به مشتری" },
                { value: "invoiced", label: "فاکتور شده" },
              ]}
              placeholder="فیلتر وضعیت"
              searchPlaceholder="جستجو در وضعیت ها"
              emptyMessage="وضعیتی پیدا نشد"
              triggerClassName="pr-10"
            />
          </div>
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
