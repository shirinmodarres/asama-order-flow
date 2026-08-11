"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageErrorMessage } from "@/components/shared/page-error-message";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getFinancialApprovalStatusLabel } from "@/lib/domain/statuses";
import { getErrorMessage } from "@/lib/api/api-error";
import { formatDate, formatNumber } from "@/lib/expert/utils";
import type { Order } from "@/lib/models/order.model";
import { listOrders } from "@/lib/services/order.service";
import { formatFaDigits } from "@/lib/utils/number-format";

type FinancialTabKey = "pending" | "needs_correction";

export default function FinancialControlOrdersPage() {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [returnedOrders, setReturnedOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeTab, setActiveTab] = useState<FinancialTabKey>("pending");

  useEffect(() => {
    let mounted = true;
    async function loadOrders() {
      setIsLoading(true);
      setError("");
      try {
        const [pendingData, correctionData] = await Promise.all([
          listOrders({ financialApprovalStatus: "pending" }),
          listOrders({ financialApprovalStatus: "needs_correction" }),
        ]);
        if (!mounted) return;
        setPendingOrders(pendingData);
        setReturnedOrders(correctionData);
      } catch (loadError) {
        if (mounted) setError(getErrorMessage(loadError));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadOrders();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredOrders = useMemo(
    () =>
      [...(activeTab === "pending" ? pendingOrders : returnedOrders)]
        .sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)))
        .filter((order) => {
          const matchesSearch =
            order.code.toLowerCase().includes(search.toLowerCase()) ||
            (order.customerName ?? "").toLowerCase().includes(search.toLowerCase()) ||
            (order.createdByName ?? "").toLowerCase().includes(search.toLowerCase());
          return matchesSearch && isWithinDateRange(order.createdAt, dateFrom, dateTo);
        }),
    [activeTab, dateFrom, dateTo, pendingOrders, returnedOrders, search],
  );

  const pendingItemCount = useMemo(
    () =>
      pendingOrders.reduce(
        (sum, order) =>
          sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
        0,
      ),
    [pendingOrders],
  );
  const returnedItemCount = useMemo(
    () =>
      returnedOrders.reduce(
        (sum, order) =>
          sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
        0,
      ),
    [returnedOrders],
  );

  const columns: DataTableColumn<Order>[] = [
    {
      key: "code",
      header: "کد سفارش",
      render: (row) => <span className="font-semibold text-[#1F3A5F]">{formatFaDigits(row.code)}</span>,
    },
    { key: "customer", header: "مشتری", render: (row) => row.customerName || "-" },
    { key: "createdByName", header: "ثبت کننده", render: (row) => row.createdByName || "-" },
    { key: "date", header: "تاریخ", render: (row) => formatDate(row.createdAt) },
    {
      key: "items",
      header: "تعداد آیتم",
      render: (row) => formatNumber(row.items.reduce((sum, item) => sum + item.quantity, 0)),
    },
    {
      key: "status",
      header: "وضعیت مالی",
        render: (row) => (
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              type="financial"
              status={row.financialApprovalStatus ?? "pending"}
            />
            <span className="text-sm text-[#334155]">
              {row.financialApprovalStatusLabel || getFinancialApprovalStatusLabel(row.financialApprovalStatus) || "-"}
            </span>
          </div>
        ),
      },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        <Link
          href={`/finance-control/orders/${row.objectId}`}
          className="rounded-xl border border-[#1F3A5F] bg-[#1F3A5F] px-3 py-1.5 text-xs !text-white hover:text-white"
        >
          بررسی سفارش
        </Link>
      ),
    },
  ];

  const hasFilters = search.trim().length > 0 || dateFrom.length > 0 || dateTo.length > 0;

  return (
    <DashboardLayout role="finance-control" title="کنترل مالی">
      <SectionHeader
        title="سفارش‌های کنترل مالی"
        description="سفارش‌های در انتظار تأیید مالی و سفارش‌های برگشتی برای اصلاح"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="در انتظار تأیید مالی"
          value={formatFaDigits(pendingOrders.length)}
          description={`${formatFaDigits(pendingItemCount)} آیتم`}
        />
        <SummaryCard
          title="نیازمند اصلاح مالی"
          value={formatFaDigits(returnedOrders.length)}
          description={`${formatFaDigits(returnedItemCount)} آیتم`}
        />
        <SummaryCard
          title="کل سفارش‌ها"
          value={formatFaDigits(pendingOrders.length + returnedOrders.length)}
          description="فقط صف کنترل مالی"
        />
      </section>

      <section className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2 border-b border-[#E2E8F0] pb-4">
          <TabButton
            active={activeTab === "pending"}
            label={`در انتظار تأیید مالی (${formatFaDigits(pendingOrders.length)})`}
            onClick={() => setActiveTab("pending")}
          />
          <TabButton
            active={activeTab === "needs_correction"}
            label={`نیازمند اصلاح (${formatFaDigits(returnedOrders.length)})`}
            onClick={() => setActiveTab("needs_correction")}
          />
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <label className="grid flex-1 gap-2 text-sm font-medium text-[#334155]">
            <span>جستجو در سفارش‌ها</span>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 right-3.5 z-10 size-4 -translate-y-1/2 text-[#6CAE75]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جستجو بر اساس کد سفارش، مشتری یا ثبت کننده"
                className="pr-10"
              />
            </div>
          </label>
          <DateRangeFilter
            value={{ from: dateFrom, to: dateTo }}
            onChange={(range) => {
              setDateFrom(range.from ?? "");
              setDateTo(range.to ?? "");
            }}
          />
          {hasFilters ? (
            <Button
              type="button"
              variant="outline"
              className="inline-flex w-fit shrink-0 items-center gap-2"
              onClick={() => {
                setSearch("");
                setDateFrom("");
                setDateTo("");
              }}
            >
              <span>حذف فیلترها</span>
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
      </section>

      {isLoading ? (
        <LoadingState title="در حال دریافت سفارش ها" />
      ) : error ? (
        <PageErrorMessage title="دریافت سفارش ها انجام نشد" message={error} />
      ) : filteredOrders.length > 0 ? (
        <DataTable
          columns={columns}
          rows={filteredOrders}
          rowKey={(row) => row.objectId || row.id}
        />
      ) : (
        <EmptyState
          title="سفارش مالی یافت نشد"
          description="فیلترها را تغییر دهید یا بعداً دوباره تلاش کنید."
        />
      )}
    </DashboardLayout>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-[#1F3A5F] px-4 py-2 text-sm font-semibold text-white"
          : "rounded-full border border-[#CBD5E1] bg-white px-4 py-2 text-sm font-medium text-[#334155]"
      }
    >
      {label}
    </button>
  );
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-[#64748B]">{title}</div>
      <div className="mt-3 text-2xl font-semibold text-[#1F3A5F]">{value}</div>
      <div className="mt-2 text-sm leading-7 text-[#64748B]">{description}</div>
    </div>
  );
}

function isWithinDateRange(value: string, dateFrom: string, dateTo: string): boolean {
  if (!dateFrom && !dateTo) return true;
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return false;
  if (dateFrom && timestamp < new Date(dateFrom).getTime()) return false;
  if (dateTo && timestamp > new Date(`${dateTo}T23:59:59.999`).getTime()) return false;
  return true;
}
