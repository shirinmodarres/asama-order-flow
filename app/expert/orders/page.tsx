"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  getOrderEditBlockReason,
  orderStatusLabel,
} from "@/lib/expert/mock-data";
import type { ExpertOrder, OrderStatus } from "@/lib/expert/types";
import {
  formatDate,
  formatNumber,
  getOrderItemCount,
  isOrderEditable,
} from "@/lib/expert/utils";
import { ListFilter, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function ExpertOrdersPage() {
  const { orders } = useExpertStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  const filteredOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)),
      )
      .filter((order) => {
        const matchesSearch = order.code
          .toLowerCase()
          .includes(search.toLowerCase()) ||
          order.customerName.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || order.status === statusFilter;
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
    {
      key: "date",
      header: "تاریخ",
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "customer",
      header: "مشتری",
      render: (row) => row.customerName,
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
      render: (row) => {
        const editable = isOrderEditable(row);
        const reason = getOrderEditBlockReason(row.status);

        return (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/expert/orders/${row.id}`}
              className="rounded-xl border border-[#E5E7EB] px-3 py-1.5 text-xs text-[#334155] hover:border-[#CBD5E1]"
            >
              مشاهده جزئیات
            </Link>
            {editable ? (
              <Link
                href={`/expert/orders/${row.id}/edit`}
                className="btn-primary rounded-xl px-3 py-1.5 text-sm font-medium text-white visited:text-white hover:text-white focus:text-white"
              >
                ویرایش
              </Link>
            ) : (
              <button
                type="button"
                disabled
                title={reason}
                className="cursor-not-allowed rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-1.5 text-sm text-[#64748B]"
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
      <section className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-[#334155]">
            <span>جستجو در سفارش ها</span>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-[#6CAE75]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="کد سفارش یا نام مشتری را وارد کنید"
                className="pr-10"
              />
            </div>
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#334155]">
            <span>فیلتر وضعیت</span>
            <div className="relative">
              <ListFilter className="pointer-events-none absolute top-1/2 right-3.5 z-10 size-4 -translate-y-1/2 text-[#6CAE75]" />
              <SearchableSelect
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as "all" | OrderStatus)
                }
                options={[
                  { value: "all", label: "همه وضعیت ها" },
                  ...Object.entries(orderStatusLabel).map(([value, label]) => ({
                    value,
                    label,
                  })),
                ]}
                placeholder="همه وضعیت ها"
                searchPlaceholder="جستجو در وضعیت ها"
                emptyMessage="وضعیتی پیدا نشد"
                triggerClassName="pr-10"
              />
            </div>
          </label>
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
          title="سفارشی یافت نشد"
          description="وضعیت یا عبارت جستجو را تغییر دهید."
        />
      )}
    </DashboardLayout>
  );
}
