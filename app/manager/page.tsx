"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ManagerSummaryCard } from "@/components/manager/manager-summary-card";
import { ActionLinkCard } from "@/components/shared/action-link-card";
import { DateRangeFilter, type DateRangeValue } from "@/components/shared/date-range-filter";
import { InlineErrorMessage } from "@/components/shared/inline-error-message";
import { SectionCard } from "@/components/ui/section-card";
import { formatCurrency, formatDate, formatNumber } from "@/lib/expert/utils";
import { getErrorMessage } from "@/lib/api/api-error";
import type { Order } from "@/lib/models/order.model";
import { listOrders } from "@/lib/services/order.service";

const TOP_EXPERT_ROWS = 6;
const TOP_DAILY_ROWS = 10;

export default function ManagerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    from: null,
    to: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        const data = await listOrders();
        if (isMounted) setOrders(data);
      } catch (loadError) {
        if (isMounted) setError(getErrorMessage(loadError));
      }
    }

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => isWithinDateRange(order.createdAt, dateRange.from, dateRange.to))
      .sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)));
  }, [dateRange.from, dateRange.to, orders]);

  const pendingFinancialCount = filteredOrders.filter(
    (order) => order.orderStatus === "pending_financial_approval",
  ).length;
  const pendingManagerCount = filteredOrders.filter(
    (order) => order.orderStatus === "pending_manager_approval",
  ).length;
  const approvedOrders = filteredOrders.filter((order) =>
    ["approved", "completed"].includes(order.orderStatus),
  );
  const approvedCount = approvedOrders.length;
  const cancelledCount = filteredOrders.filter(
    (order) => order.orderStatus === "cancelled",
  ).length;
  const warehouseInProgressCount = filteredOrders.filter((order) =>
    ["reviewing", "processing", "dispatchIssued"].includes(
      order.warehouseStatus,
    ),
  ).length;

  const totalSalesAmount = approvedOrders.reduce(
    (sum, order) => sum + getOrderTotalAmount(order),
    0,
  );
  const totalApprovedQuantity = approvedOrders.reduce(
    (sum, order) => sum + getOrderTotalQuantity(order),
    0,
  );
  const averageOrderAmount = approvedCount ? totalSalesAmount / approvedCount : 0;

  const expertRows = useMemo(
    () => groupByExpert(approvedOrders).slice(0, TOP_EXPERT_ROWS),
    [approvedOrders],
  );
  const channelRows = useMemo(
    () => groupByChannel(approvedOrders),
    [approvedOrders],
  );
  const trendRows = useMemo(
    () => groupByDay(approvedOrders).slice(0, TOP_DAILY_ROWS),
    [approvedOrders],
  );

  const topTrendValue = Math.max(
    ...trendRows.map((row) => row.amount),
    ...expertRows.map((row) => row.amount),
    ...channelRows.map((row) => row.amount),
    1,
  );

  return (
    <DashboardLayout role="manager" title="داشبورد مدیر فروش">
      {error ? <InlineErrorMessage message={error} /> : null}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ManagerSummaryCard
            title="در انتظار تأیید مالی"
            value={pendingFinancialCount}
            hint="صف کنترل مالی"
          />
          <ManagerSummaryCard
            title="در انتظار تأیید مدیر"
            value={pendingManagerCount}
            hint="سفارش‌های آماده تصمیم نهایی"
          />
          <ManagerSummaryCard
            title="سفارش‌های تأییدشده"
            value={approvedCount}
            hint="سفارش‌های وارد مسیر فروش شده"
          />
          <ManagerSummaryCard
            title="مبلغ کل فروش"
            value={formatCurrency(totalSalesAmount)}
            hint="فقط سفارش‌های تأییدشده در بازه انتخابی"
          />
        </div>

        <SectionCard title="فیلتر گزارش" description="بازه زمانی گزارش را انتخاب کنید.">
          <div className="grid gap-3">
            <DateRangeFilter
              value={dateRange}
              onChange={setDateRange}
              label="بازه گزارش"
              placeholder="همه بازه‌ها"
            />
            <div className="grid gap-3 rounded-[18px] border border-[#E6EDF4] bg-white p-4">
              <KpiLine label="تعداد اقلام فروش" value={formatNumber(totalApprovedQuantity)} />
              <KpiLine label="میانگین مبلغ سفارش" value={formatCurrency(averageOrderAmount)} />
              <KpiLine label="سفارش‌های لغوشده" value={formatNumber(cancelledCount)} />
              <KpiLine label="سفارش‌های در جریان انبار" value={formatNumber(warehouseInProgressCount)} />
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <ReportCard
          title="فروش به تفکیک کارشناس"
          description="سهم هر کارشناس از سفارش‌های تأییدشده در بازه انتخابی"
          rows={expertRows}
          emptyMessage="در این بازه سفارشی برای نمایش وجود ندارد."
          topValue={topTrendValue}
        />
        <SectionCard
          title="ترکیب فروش بازار / ناجا"
          description="نمایش سهم هر دسته در سفارش‌های تأییدشده"
        >
          {channelRows.some((row) => row.amount > 0) ? (
            <div className="grid gap-5">
              <DonutChart rows={channelRows} />
              <div className="grid gap-3">
                {channelRows.map((row) => (
                  <ChannelLegendRow key={row.key} row={row} total={totalSalesAmount} />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState message="برای این بازه داده‌ای ثبت نشده است." />
          )}
        </SectionCard>
      </section>

      <SectionCard
        title="روند فروش"
        description="آخرین روزهای دارای سفارش تأییدشده در بازه انتخابی"
      >
        {trendRows.length ? (
          <div className="grid gap-3">
            {trendRows.map((row) => (
              <TrendRow
                key={row.key}
                label={row.label}
                count={row.count}
                amount={row.amount}
                topValue={topTrendValue}
              />
            ))}
          </div>
        ) : (
          <EmptyState message="در بازه انتخابی روند فروشی برای نمایش وجود ندارد." />
        )}
      </SectionCard>

      <section className="grid gap-4 md:grid-cols-2">
        <ActionLinkCard
          href="/manager/pending-orders"
          icon="clipboard-check"
          title="بررسی سفارش‌ها"
          description="مشاهده سفارش‌های در انتظار تأیید و ثبت تصمیم نهایی"
        />
        <ActionLinkCard
          href="/manager/order-tracking"
          icon="activity"
          title="مشاهده روند سفارش‌ها"
          description="پایش وضعیت کلی سفارش‌ها از تأیید تا فاکتور"
        />
      </section>
    </DashboardLayout>
  );
}

function getOrderTotalQuantity(order: Order): number {
  return order.items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);
}

function getOrderTotalAmount(order: Order): number {
  return order.items.reduce(
    (sum, item) => sum + Number(item.quantity ?? 0) * Number(item.unitPrice ?? 0),
    0,
  );
}

function groupByExpert(orders: Order[]) {
  const map = new Map<
    string,
    { key: string; label: string; count: number; quantity: number; amount: number }
  >();

  for (const order of orders) {
    const key = order.createdByName?.trim() || order.expertUserId || "نامشخص";
    const current = map.get(key) ?? {
      key,
      label: order.createdByName?.trim() || order.expertUserId || "نامشخص",
      count: 0,
      quantity: 0,
      amount: 0,
    };

    current.count += 1;
    current.quantity += getOrderTotalQuantity(order);
    current.amount += getOrderTotalAmount(order);
    map.set(key, current);
  }

  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

function groupByChannel(orders: Order[]) {
  const grouped = [
    { key: "normal", label: "بازار", count: 0, quantity: 0, amount: 0 },
    { key: "naja", label: "ناجا", count: 0, quantity: 0, amount: 0 },
  ];

  for (const order of orders) {
    const target = order.orderType === "naja" ? grouped[1] : grouped[0];
    target.count += 1;
    target.quantity += getOrderTotalQuantity(order);
    target.amount += getOrderTotalAmount(order);
  }

  return grouped;
}

function groupByDay(orders: Order[]) {
  const map = new Map<
    string,
    { key: string; label: string; count: number; quantity: number; amount: number }
  >();

  for (const order of orders) {
    const key = getDateKey(order.createdAt);
    const current = map.get(key) ?? {
      key,
      label: formatDate(order.createdAt),
      count: 0,
      quantity: 0,
      amount: 0,
    };

    current.count += 1;
    current.quantity += getOrderTotalQuantity(order);
    current.amount += getOrderTotalAmount(order);
    map.set(key, current);
  }

  return Array.from(map.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
}

function getDateKey(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

function isWithinDateRange(
  value: string,
  dateFrom?: string | null,
  dateTo?: string | null,
): boolean {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return false;

  const fromTimestamp = dateFrom ? new Date(dateFrom).getTime() : null;
  if (fromTimestamp && timestamp < fromTimestamp) return false;

  const toTimestamp = dateTo ? new Date(dateTo).getTime() : null;
  if (toTimestamp) {
    const endOfDay = new Date(toTimestamp);
    endOfDay.setHours(23, 59, 59, 999);
    if (timestamp > endOfDay.getTime()) return false;
  }

  return true;
}

function ReportCard({
  title,
  description,
  rows,
  emptyMessage,
  topValue,
}: {
  title: string;
  description: string;
  rows: Array<{
    key: string;
    label: string;
    count: number;
    quantity: number;
    amount: number;
  }>;
  emptyMessage: string;
  topValue: number;
}) {
  return (
    <SectionCard title={title} description={description}>
      {rows.length ? (
        <div className="grid gap-3">
          {rows.map((row) => (
            <div key={row.key} className="rounded-[18px] border border-[#E6EDF4] bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#102034]">{row.label}</p>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    تعداد سفارش: {formatNumber(row.count)} · تعداد اقلام: {formatNumber(row.quantity)}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#102034]">{formatCurrency(row.amount)}</p>
                  <p className="mt-1 text-xs text-[#6B7280]">سهم از کل</p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EEF3F8]">
                <div
                  className="h-full rounded-full bg-[#2C4A73]"
                  style={{ width: `${Math.max((row.amount / topValue) * 100, 8)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message={emptyMessage} />
      )}
    </SectionCard>
  );
}

function DonutChart({
  rows,
}: {
  rows: Array<{ key: string; label: string; count: number; quantity: number; amount: number }>;
}) {
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const primary = rows[0];
  const secondary = rows[1];
  const primaryRatio = total > 0 ? primary.amount / total : 0;
  const secondaryRatio = total > 0 ? secondary.amount / total : 0;
  const primaryStroke = Math.max(primaryRatio * 283, 18);
  const secondaryStroke = Math.max(secondaryRatio * 283, 18);

  return (
    <div className="flex items-center justify-center">
      <div className="relative h-56 w-56">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#EEF3F8"
            strokeWidth="14"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#2C4A73"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${primaryStroke} ${283 - primaryStroke}`}
            strokeDashoffset="0"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#6CAE75"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${secondaryStroke} ${283 - secondaryStroke}`}
            strokeDashoffset={-primaryStroke}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-medium text-[#6B7280]">جمع فروش</p>
          <p className="mt-2 text-2xl font-black text-[#102034]">{formatCurrency(total)}</p>
        </div>
      </div>
    </div>
  );
}

function ChannelLegendRow({
  row,
  total,
}: {
  row: { key: string; label: string; count: number; quantity: number; amount: number };
  total: number;
}) {
  const percent = total > 0 ? Math.round((row.amount / total) * 100) : 0;
  const color = row.key === "naja" ? "bg-[#6CAE75]" : "bg-[#2C4A73]";

  return (
    <div className="rounded-[18px] border border-[#E6EDF4] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`size-3 rounded-full ${color}`} />
          <div>
            <p className="text-sm font-bold text-[#102034]">{row.label}</p>
            <p className="mt-1 text-xs text-[#6B7280]">
              تعداد سفارش: {formatNumber(row.count)} · تعداد اقلام: {formatNumber(row.quantity)}
            </p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-[#102034]">{formatCurrency(row.amount)}</p>
          <p className="mt-1 text-xs text-[#6B7280]">{formatNumber(percent)}٪</p>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EEF3F8]">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.max(percent, 8)}%` }}
        />
      </div>
    </div>
  );
}

function TrendRow({
  label,
  count,
  amount,
  topValue,
}: {
  label: string;
  count: number;
  amount: number;
  topValue: number;
}) {
  return (
    <div className="rounded-[18px] border border-[#E6EDF4] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#102034]">{label}</p>
          <p className="mt-1 text-xs text-[#6B7280]">تعداد سفارش: {formatNumber(count)}</p>
        </div>
        <p className="text-sm font-bold text-[#102034]">{formatCurrency(amount)}</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EEF3F8]">
        <div
          className="h-full rounded-full bg-[#6CAE75]"
          style={{ width: `${Math.max((amount / topValue) * 100, 8)}%` }}
        />
      </div>
    </div>
  );
}

function KpiLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[14px] bg-[#F8FAFC] px-4 py-3">
      <span className="text-sm font-medium text-[#475569]">{label}</span>
      <span className="text-sm font-bold text-[#102034]">{value}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#D7E1EA] bg-[#FBFCFE] px-5 py-8 text-center text-sm text-[#6B7280]">
      {message}
    </div>
  );
}
