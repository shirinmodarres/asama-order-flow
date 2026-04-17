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
import { WarehouseStatusBadge } from "@/components/warehouse/warehouse-status-badge";
import type { ExpertOrder } from "@/lib/expert/types";
import {
  formatDate,
  formatNumber,
  getOrderItemCount,
} from "@/lib/expert/utils";

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
          order.status === "approved" && order.warehouseStatus === "reviewing",
      )
      .filter((order) => {
        const matchesSearch =
          order.code.toLowerCase().includes(search.toLowerCase()) ||
          order.createdBy.toLowerCase().includes(search.toLowerCase());

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
            href={`/warehouse/orders/${row.id}/exit-slip`}
            className="rounded-xl border border-[#1F3A5F] bg-[#1F3A5F] px-3 py-1.5 text-xs !text-white"
          >
            ثبت حواله خروج
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
      <SectionHeader
        title="صف بررسی انبار"
        description="فقط سفارش های تاییدشده مدیر فروش در این لیست نمایش داده می شوند."
      />

      <section className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجو بر اساس کد سفارش یا ثبت کننده"
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#1F3A5F]"
          />
          <select
            value={brandFilter}
            onChange={(event) => setBrandFilter(event.target.value)}
            className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#1F3A5F]"
          >
            <option value="all">همه برندها</option>
            {allBrands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
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
          title="سفارش آماده بررسی وجود ندارد"
          description="در حال حاضر سفارشی در وضعیت در بررسی انبار موجود نیست."
        />
      )}
    </DashboardLayout>
  );
}
