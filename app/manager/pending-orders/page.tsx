"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { orderStatusLabel } from "@/lib/expert/mock-data";
import type { ExpertOrder, OrderStatus } from "@/lib/expert/types";
import {
  formatDate,
  formatNumber,
  getOrderItemCount,
} from "@/lib/expert/utils";
import { ListFilter, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

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
          order.createdBy.toLowerCase().includes(search.toLowerCase()) ||
          order.customerName.toLowerCase().includes(search.toLowerCase());
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
    { key: "customer", header: "مشتری", render: (row) => row.customerName },
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
      <section className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 right-3.5 z-10 size-4 -translate-y-1/2 text-[#6CAE75]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجو بر اساس کد سفارش، مشتری یا نام ثبت کننده"
              className="pr-10"
            />
          </div>
          <div className="relative">
            <ListFilter className="pointer-events-none absolute top-1/2 right-3.5 z-10 size-4 -translate-y-1/2 text-[#6CAE75]" />
            <SearchableSelect
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as "pending" | "all" | OrderStatus)
              }
              options={[
                { value: "pending", label: "در انتظار تایید" },
                { value: "all", label: "همه وضعیت ها" },
                ...Object.entries(orderStatusLabel).map(([value, label]) => ({
                  value,
                  label,
                })),
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
          title="سفارش در انتظار تایید یافت نشد"
          description="فیلترها را تغییر دهید یا وارد روند سفارش ها شوید."
        />
      )}
    </DashboardLayout>
  );
}
