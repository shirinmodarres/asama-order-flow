"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { InlineErrorMessage } from "@/components/shared/inline-error-message";
import { LoadingState } from "@/components/shared/loading-state";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/api-error";
import type { PriceList } from "@/lib/models/pricing.model";
import { listGeneratedPriceLists } from "@/lib/services/pricing.service";
import { formatDateTime, formatNumber } from "@/lib/expert/utils";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { formatFaDigits } from "@/lib/utils/number-format";

export default function GeneratedPriceListsPage() {
  const [rows, setRows] = useState<PriceList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");

  useEffect(() => {
    let mounted = true;
    listGeneratedPriceLists()
      .then((data) => {
        if (mounted) setRows(data);
      })
      .catch((err) => {
        if (mounted) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const brandOptions = Array.from(
    new Map(rows.map((row) => [row.brandName || "-", row.brandName || "-"])),
    ([value, label]) => ({ value, label }),
  );

  const filteredRows = rows.filter((row) => {
    const query = search.trim().toLowerCase();
    const matchesBrand = !brandFilter || (row.brandName || "-") === brandFilter;
    const matchesSearch =
      !query ||
      (row.brandName ?? "").toLowerCase().includes(query) ||
      (row.displayName ?? "").toLowerCase().includes(query) ||
      (row.internalCode ?? "").toLowerCase().includes(query) ||
      (row.referenceInternalCode ?? "").toLowerCase().includes(query) ||
      (row.typeTitle ?? "").toLowerCase().includes(query);
    return matchesBrand && matchesSearch;
  });

  const columns: DataTableColumn<PriceList>[] = [
    { key: "brand", header: "برند", render: (row) => row.brandName || "-" },
    { key: "name", header: "لیست قیمت", render: (row) => row.displayName || row.name || "-" },
    { key: "code", header: "کد لیست قیمت", render: (row) => row.internalCode ? formatFaDigits(row.internalCode) : "-" },
    { key: "type", header: "نوع", render: (row) => row.typeTitle || row.typeCode || "-" },
    { key: "reference", header: "کد سپیدار", render: (row) => row.referenceInternalCode ? formatFaDigits(row.referenceInternalCode) : "-" },
    { key: "items", header: "تعداد کالا", render: (row) => formatNumber(row.itemCount) },
    { key: "generated", header: "زمان تولید", render: (row) => row.generatedAt ? formatDateTime(row.generatedAt) : "-" },
    {
      key: "status",
      header: "وضعیت",
      render: (row) => (
        <Badge variant={row.isActive ? "success" : "neutral"}>
          {getPriceListStatusLabel(row)}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        row.objectId || row.id ? (
          <Button asChild size="sm" variant="outline">
            <Link href={`/support/pricing/generated-price-lists/${row.objectId || row.id}`}>جزئیات</Link>
          </Button>
        ) : "-"
      ),
    },
  ];

  return (
    <DashboardLayout role="support" title="لیست‌های قیمت تولیدی">
      <SectionHeader title="لیست‌های قیمت تولیدی" description="لیست‌های داخلی ساخته‌شده از مرجع برند" />
      <section className="mb-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
        <label className="grid gap-2 text-sm font-medium text-[#334155]">
          <span>جستجو</span>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجو در برند، عنوان، کد یا نوع"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-[#334155]">
          <span>فیلتر برند</span>
          <SearchableSelect
            value={brandFilter || undefined}
            onValueChange={setBrandFilter}
            options={[{ value: "", label: "همه برندها" }, ...brandOptions]}
            placeholder="همه برندها"
            searchPlaceholder="جستجو در برندها"
            emptyMessage="برندی پیدا نشد"
          />
        </label>
      </section>
      {error ? <InlineErrorMessage message={error} /> : null}
      {isLoading ? <LoadingState title="در حال دریافت لیست‌های قیمت" /> : filteredRows.length ? (
        <DataTable columns={columns} rows={filteredRows} rowKey={(row) => row.objectId} />
      ) : (
        <EmptyState title="لیست تولیدی وجود ندارد" description="از صفحه لیست‌های مرجع، برای مرجع فعال برند لیست قیمت تولید کنید." />
      )}
    </DashboardLayout>
  );
}

function getPriceListStatusLabel(priceList: PriceList): string {
  const status = (priceList as PriceList & { status?: string | null }).status;
  if (priceList.isActive) return "فعال";
  if (status === "inactive" || status === "disabled") return "غیرفعال";
  return "آرشیو";
}
