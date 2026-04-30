"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageErrorMessage } from "@/components/shared/page-error-message";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/api/api-error";
import { formatDate, formatDateTime } from "@/lib/expert/utils";
import type { ExitSlip } from "@/lib/models/warehouse.model";
import { listExitSlips } from "@/lib/services/warehouse.service";
import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface ExitSlipRow {
  slip: ExitSlip;
}

export default function WarehouseExitSlipsPage() {
  const [exitSlips, setExitSlips] = useState<ExitSlip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadExitSlips() {
      setIsLoading(true);
      setError("");

      try {
        const data = await listExitSlips();
        if (isMounted) setExitSlips(data);
      } catch (loadError) {
        if (isMounted) setError(getErrorMessage(loadError));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadExitSlips();

    return () => {
      isMounted = false;
    };
  }, []);

  const rows: ExitSlipRow[] = useMemo(() => {
    return exitSlips
      .map((slip) => ({ slip }))
      .filter((row) => {
        const query = search.toLowerCase();
        return (
          row.slip.slipCode.toLowerCase().includes(query) ||
          row.slip.orderCode.toLowerCase().includes(query)
        );
      })
      .sort(
        (a, b) =>
          Number(new Date(b.slip.createdAt)) -
          Number(new Date(a.slip.createdAt)),
      );
  }, [exitSlips, search]);

  const columns: DataTableColumn<ExitSlipRow>[] = [
    {
      key: "slip",
      header: "شماره حواله",
      render: (row) => (
        <span className="font-semibold text-[#1F3A5F]">
          {row.slip.slipCode}
        </span>
      ),
    },
    { key: "order", header: "سفارش مرتبط", render: (row) => row.slip.orderCode || "-" },
    {
      key: "exit-date",
      header: "تاریخ خروج",
      render: (row) => formatDate(row.slip.exitDate),
    },
    {
      key: "created-at",
      header: "زمان ثبت",
      render: (row) => formatDateTime(row.slip.createdAt),
    },
    {
      key: "status",
      header: "وضعیت فعلی",
      render: (row) => (row.slip.deliveryConfirmed ? "تحویل شده" : "صادر شده"),
    },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        <Link
          href={`/warehouse/exit-slips/${row.slip.objectId || row.slip.id}`}
          className="rounded-xl border border-[#E5E7EB] px-3 py-1.5 text-xs text-[#334155]"
        >
          مشاهده جزئیات
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout role="warehouse" title="حواله های خروج">
      <section className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 right-3.5 z-10 size-4 -translate-y-1/2 text-[#6CAE75]" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجو بر اساس شماره حواله یا کد سفارش"
            className="pr-10"
          />
        </div>
      </section>

      {isLoading ? (
        <LoadingState title="در حال دریافت حواله ها" />
      ) : error ? (
        <PageErrorMessage title="دریافت حواله ها انجام نشد" message={error} />
      ) : rows.length > 0 ? (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.slip.objectId || row.slip.id}
        />
      ) : (
        <EmptyState
          title="حواله خروجی ثبت نشده"
          description="هنوز حواله خروجی برای سفارش ها ثبت نشده است."
        />
      )}
    </DashboardLayout>
  );
}
