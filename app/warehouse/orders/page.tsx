"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderSourceBadge } from "@/components/shared/order-source-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { WarehouseStatusBadge } from "@/components/warehouse/warehouse-status-badge";
import type { ExpertOrder } from "@/lib/expert/types";
import {
  formatDate,
  formatNumber,
  getOrderItemCount,
} from "@/lib/expert/utils";
import { Search, Tags } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function WarehouseOrdersPage() {
  const { orders, getProductById } = useExpertStore();
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");

  const allBrands = useMemo(() => {
    const values = new Set<string>();

    for (const order of orders) {
      for (const item of order.items) {
        const product = getProductById(item.productId);
        if (product) values.add(product.brand);
      }
    }

    return Array.from(values);
  }, [getProductById, orders]);

  const filteredOrders = useMemo(() => {
    return [...orders]
      .filter(
        (order) =>
          (order.orderSource === "normal" &&
            order.status === "approved" &&
            order.warehouseStatus === "reviewing") ||
          (order.orderSource === "naja" &&
            order.status === "approved" &&
            order.warehouseStatus === "awaitingNajaDetails"),
      )
      .filter((order) => {
        const matchesSearch =
          order.code.toLowerCase().includes(search.toLowerCase()) ||
          order.createdBy.toLowerCase().includes(search.toLowerCase()) ||
          order.customerName.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;
        if (brandFilter === "all") return true;

        return order.items.some(
          (item) => getProductById(item.productId)?.brand === brandFilter,
        );
      })
      .sort(
        (a, b) => Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt)),
      );
  }, [brandFilter, getProductById, orders, search]);

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
      key: "source",
      header: "منبع",
      render: (row) => <OrderSourceBadge source={row.orderSource} />,
    },
    { key: "customer", header: "مشتری", render: (row) => row.customerName },
    {
      key: "date",
      header: "تاریخ تایید",
      render: (row) => formatDate(row.updatedAt),
    },
    {
      key: "item-count",
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
      render: (row) => <WarehouseStatusBadge status={row.warehouseStatus} />,
    },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Link
            href={
              row.orderSource === "naja"
                ? `/warehouse/orders/${row.id}/naja-details`
                : `/warehouse/orders/${row.id}/exit-slip`
            }
            className="rounded-xl border border-[#1F3A5F] bg-[#1F3A5F] px-3 py-1.5 text-xs !text-white"
          >
            {row.orderSource === "naja"
              ? "تکمیل اطلاعات انبار"
              : "ثبت حواله خروج"}
          </Link>
          <Link
            href={`/warehouse/orders/${row.id}`}
            className="rounded-xl border border-[#E5E7EB] px-3 py-1.5 text-xs text-[#334155]"
          >
            مشاهده جزئیات
          </Link>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout role="warehouse" title="سفارش های تاییدشده">
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
            <Tags className="pointer-events-none absolute top-1/2 right-3.5 z-10 size-4 -translate-y-1/2 text-[#6CAE75]" />
            <SearchableSelect
              value={brandFilter}
              onValueChange={setBrandFilter}
              options={[
                { value: "all", label: "همه برندها" },
                ...allBrands.map((brand) => ({ value: brand, label: brand })),
              ]}
              placeholder="فیلتر برند"
              searchPlaceholder="جستجو در برندها"
              emptyMessage="برندی پیدا نشد"
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
          title="سفارش آماده بررسی وجود ندارد"
          description="در حال حاضر سفارشی در وضعیت در بررسی انبار موجود نیست."
        />
      )}
    </DashboardLayout>
  );
}
