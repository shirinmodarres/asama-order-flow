"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { ProductStatusBadge } from "@/components/support/product-status-badge";
import type { Product } from "@/lib/expert/types";
import { formatNumber, getAvailableStock } from "@/lib/expert/utils";

export default function SupportProductsPage() {
  const { products } = useExpertStore();
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");

  const brands = useMemo(
    () => Array.from(new Set(products.map((product) => product.brand))),
    [products],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesBrand =
        brandFilter === "all" || product.brand === brandFilter;
      return matchesSearch && matchesBrand;
    });
  }, [brandFilter, products, search]);

  const columns: DataTableColumn<Product>[] = [
    {
      key: "name",
      header: "نام کالا",
      render: (row) => (
        <span className="font-medium text-[#1F3A5F]">{row.name}</span>
      ),
    },
    { key: "brand", header: "برند", render: (row) => row.brand },
    { key: "category", header: "دسته بندی", render: (row) => row.category },
    {
      key: "total",
      header: "موجودی کل",
      render: (row) => formatNumber(row.totalStock),
    },
    {
      key: "reserved",
      header: "موجودی رزروشده",
      render: (row) => formatNumber(row.reservedStock),
    },
    {
      key: "available",
      header: "موجودی قابل استفاده",
      render: (row) => formatNumber(getAvailableStock(row)),
    },
    {
      key: "status",
      header: "وضعیت",
      render: (row) => <ProductStatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        <Link
          href={`/support/products/${row.id}/edit`}
          className="rounded-[12px] border border-[#E5E7EB] px-3 py-1.5 text-xs text-[#334155]"
        >
          ویرایش
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout role="support" title="کالاها">
      <SectionHeader
        title="فهرست کالاها"
        description="مدیریت اطلاعات پایه کالا و وضعیت فعال بودن"
        actions={
          <Link
            href="/support/products/new"
            className="rounded-[12px] border border-[#1F3A5F] bg-[#1F3A5F] px-4 py-2 text-sm !text-white"
          >
            تعریف کالای جدید
          </Link>
        }
      />

      <section className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجو بر اساس نام کالا"
            className="w-full rounded-[12px] border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#1F3A5F]"
          />
          <select
            value={brandFilter}
            onChange={(event) => setBrandFilter(event.target.value)}
            className="w-full rounded-[12px] border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#1F3A5F]"
          >
            <option value="all">همه برندها</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
      </section>

      {filteredProducts.length > 0 ? (
        <DataTable
          columns={columns}
          rows={filteredProducts}
          rowKey={(row) => row.id}
        />
      ) : (
        <EmptyState
          title="کالایی یافت نشد"
          description="فیلترها را تغییر دهید یا کالای جدید ثبت کنید."
        />
      )}
    </DashboardLayout>
  );
}
