"use client";

import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { InventorySummaryCard } from "@/components/shared/inventory-summary-card";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import type { Product } from "@/lib/expert/types";
import { formatNumber, getAvailableStock } from "@/lib/expert/utils";

type InventoryStatus = "normal" | "warning" | "critical";

export default function ExpertInventoryPage() {
  const { products } = useExpertStore();
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("all");

  const brands = useMemo(() => Array.from(new Set(products.map((product) => product.brand))), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchesBrand = brand === "all" || product.brand === brand;
      return matchesSearch && matchesBrand;
    });
  }, [brand, products, search]);

  const summary = useMemo(() => {
    return products.reduce(
      (acc, product) => {
        acc.total += product.totalStock;
        acc.reserved += product.reservedStock;
        acc.available += getAvailableStock(product);
        return acc;
      },
      { total: 0, reserved: 0, available: 0 },
    );
  }, [products]);

  const columns: DataTableColumn<Product>[] = [
    { key: "name", header: "نام کالا", render: (row) => <span className="font-medium text-[#1F3A5F]">{row.name}</span> },
    { key: "brand", header: "برند", render: (row) => row.brand },
    { key: "total", header: "موجودی کل", render: (row) => formatNumber(row.totalStock) },
    { key: "reserved", header: "موجودی رزروشده", render: (row) => formatNumber(row.reservedStock) },
    { key: "available", header: "موجودی قابل استفاده", render: (row) => formatNumber(getAvailableStock(row)) },
    {
      key: "status",
      header: "وضعیت",
      render: (row) => <StatusBadge type="inventory" status={getInventoryStatus(row)} />,
    },
  ];

  return (
    <DashboardLayout role="expert" title="موجودی کالاها">
      <SectionHeader title="فهرست موجودی" description="نمایش موجودی کل، رزرو شده و قابل استفاده برای ثبت سفارش" />

      <section className="grid gap-4 md:grid-cols-3">
        <InventorySummaryCard title="موجودی کل" value={summary.total} hint="مجموع تمام اقلام انبار" />
        <InventorySummaryCard title="موجودی رزروشده" value={summary.reserved} hint="اختصاص یافته به سفارش های در انتظار تایید" />
        <InventorySummaryCard title="موجودی قابل استفاده" value={summary.available} hint="قابل انتخاب برای سفارش جدید" />
      </section>

      <section className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجو بر اساس نام کالا"
            className="w-full rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#1F3A5F]"
          />
          <select
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            className="w-full rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#1F3A5F]"
          >
            <option value="all">همه برندها</option>
            {brands.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </section>

      {filteredProducts.length > 0 ? (
        <DataTable columns={columns} rows={filteredProducts} rowKey={(row) => row.id} />
      ) : (
        <EmptyState title="کالایی یافت نشد" description="فیلترها را تغییر دهید یا عبارت جستجو را اصلاح کنید." />
      )}
    </DashboardLayout>
  );
}

function getInventoryStatus(product: Product): InventoryStatus {
  const available = getAvailableStock(product);
  if (available <= 0) return "critical";
  if (available <= product.totalStock * 0.2) return "warning";
  return "normal";
}
