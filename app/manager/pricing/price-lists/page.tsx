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
import { listActivePriceLists } from "@/lib/services/pricing.service";
import { formatDateTime, formatNumber } from "@/lib/expert/utils";
import { formatFaDigits } from "@/lib/utils/number-format";

export default function ManagerActivePriceListsPage() {
  const [rows, setRows] = useState<PriceList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    listActivePriceLists()
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

  const columns: DataTableColumn<PriceList>[] = [
    { key: "brand", header: "برند", render: (row) => row.brandName || "-" },
    { key: "name", header: "لیست قیمت", render: (row) => row.displayName || row.name || "-" },
    { key: "code", header: "کد داخلی", render: (row) => row.internalCode ? formatFaDigits(row.internalCode) : "-" },
    { key: "type", header: "نوع", render: (row) => row.typeTitle || row.typeCode || "-" },
    { key: "reference", header: "کد مرجع", render: (row) => row.referenceInternalCode ? formatFaDigits(row.referenceInternalCode) : "-" },
    { key: "items", header: "تعداد کالا", render: (row) => formatNumber(row.itemCount) },
    { key: "generated", header: "زمان تولید", render: (row) => row.generatedAt ? formatDateTime(row.generatedAt) : "-" },
    {
      key: "status",
      header: "وضعیت",
      render: (row) => (
        <Badge variant={row.isActive ? "success" : "neutral"}>
          {row.isActive ? "فعال" : "آرشیو"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        row.objectId || row.id ? (
          <Button asChild size="sm" variant="outline">
            <Link href={`/support/pricing/generated-price-lists/${row.objectId || row.id}`}>
              جزئیات
            </Link>
          </Button>
        ) : "-"
      ),
    },
  ];

  return (
    <DashboardLayout role="manager" title="لیست قیمت‌ها">
      <SectionHeader
        title="لیست قیمت‌های فعال"
        description="تمام لیست‌های قیمت فعال برندها برای بررسی و استفاده در دسترس هستند."
      />
      {error ? <InlineErrorMessage message={error} /> : null}
      {isLoading ? (
        <LoadingState title="در حال دریافت لیست‌های قیمت" />
      ) : rows.length ? (
        <DataTable columns={columns} rows={rows} rowKey={(row) => row.objectId} />
      ) : (
        <EmptyState
          title="لیست قیمت فعالی پیدا نشد"
          description="فعلاً هیچ لیست قیمت فعالی برای نمایش وجود ندارد."
        />
      )}
    </DashboardLayout>
  );
}
