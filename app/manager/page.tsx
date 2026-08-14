"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ManagerSummaryCard } from "@/components/manager/manager-summary-card";
import { ActionLinkCard } from "@/components/shared/action-link-card";
import { DateRangeFilter, type DateRangeValue } from "@/components/shared/date-range-filter";
import { InlineErrorMessage } from "@/components/shared/inline-error-message";
import { SectionCard } from "@/components/ui/section-card";
import { getErrorMessage } from "@/lib/api/api-error";
import type { Order } from "@/lib/models/order.model";
import { listOrders } from "@/lib/services/order.service";
import { formatCurrency, formatDate, formatNumber } from "@/lib/expert/utils";

const TOP_EXPERT_ROWS = 6;
const TOP_DAILY_ROWS = 12;

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

  const filteredOrders = useMemo(
    () =>
      orders
        .filter((order) =>
          isWithinDateRange(order.createdAt, dateRange.from, dateRange.to),
        )
        .sort(
          (a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)),
        ),
    [dateRange.from, dateRange.to, orders],
  );

  const pendingFinancialCount = filteredOrders.filter(
    (order) => order.orderStatus === "pending_financial_approval",
  ).length;
  const pendingManagerCount = filteredOrders.filter(
    (order) => order.orderStatus === "pending_manager_approval",
  ).length;
  const approvedOrders = filteredOrders.filter(
    (order) => order.orderStatus === "approved",
  );
  const invoicedOrders = filteredOrders.filter(
    (order) => order.orderStatus === "invoiced",
  );
  const warehouseWaitingCount = filteredOrders.filter((order) =>
    ["reserved", "reviewing"].includes(order.warehouseStatus),
  ).length;

  const totalSalesAmount = approvedOrders.reduce(
    (sum, order) => sum + getOrderTotalAmount(order),
    0,
  );
  const totalSalesQuantity = approvedOrders.reduce(
    (sum, order) => sum + getOrderTotalQuantity(order),
    0,
  );
  const averageOrderAmount = approvedOrders.length
    ? totalSalesAmount / approvedOrders.length
    : 0;

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

  const maxAmount = Math.max(
    1,
    ...expertRows.map((row) => row.amount),
    ...channelRows.map((row) => row.amount),
    ...trendRows.map((row) => row.amount),
  );

  return (
    <DashboardLayout role="manager" title="داشبورد مدیر فروش">
      <div className="space-y-4">
        {error ? <InlineErrorMessage message={error} /> : null}

        <section className="grid gap-4">
          <SectionCard
            title="بازه زمانی گزارش"
            description="اگر بازه‌ای انتخاب نشود، کل گزارش نمایش داده می‌شود."
          >
            <div className="max-w-4xl">
              <DateRangeFilter
                value={dateRange}
                onChange={setDateRange}
                label="بازه گزارش"
                placeholder="کل گزارش"
              />
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ManagerSummaryCard
            title="سفارش‌های در انتظار تأیید مالی"
            value={pendingFinancialCount}
            hint="سفارش‌های آماده بررسی مالی"
          />
          <ManagerSummaryCard
            title="سفارش‌های در انتظار تأیید مدیر"
            value={pendingManagerCount}
            hint="سفارش‌هایی که باید تعیین تکلیف شوند"
          />
          <ManagerSummaryCard
            title="سفارش‌های در انتظار انبار"
            value={warehouseWaitingCount}
            hint="رزرو شده و در صف عملیات انبار"
          />
          <ManagerSummaryCard
            title="سفارش‌های فاکتور شده"
            value={invoicedOrders.length}
            hint="ثبت شده در مسیر مالی"
          />
          <ManagerSummaryCard
            title="سفارش‌های تأیید شده"
            value={approvedOrders.length}
            hint="سفارش‌هایی که تأیید نهایی شده‌اند"
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <SectionCard
            title="مبلغ کل فروش"
            description="جمع فروش قطعی در بازه انتخابی"
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricBox
                label="مبلغ کل فروش"
                value={formatCurrency(totalSalesAmount)}
              />
              <MetricBox
                label="تعداد اقلام فروش"
                value={formatNumber(totalSalesQuantity)}
              />
              <MetricBox
                label="تعداد سفارش‌های تأیید شده"
                value={formatNumber(approvedOrders.length)}
              />
              <MetricBox
                label="میانگین مبلغ سفارش"
                value={formatCurrency(averageOrderAmount)}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="خلاصه فروش"
            description="نمایی سریع از وضعیت فروش در همین بازه"
          >
            <div className="grid gap-3">
              <MiniStat
                label="فروش تأیید شده"
                value={formatCurrency(totalSalesAmount)}
                accent="bg-[#1F3A5F]"
              />
              <MiniStat
                label="سفارش‌های تأیید شده"
                value={formatNumber(approvedOrders.length)}
                accent="bg-[#6CAE75]"
              />
              <MiniStat
                label="سفارش‌های فاکتور شده"
                value={formatNumber(invoicedOrders.length)}
                accent="bg-[#F59E0B]"
              />
              <MiniStat
                label="در انتظار انبار"
                value={formatNumber(warehouseWaitingCount)}
                accent="bg-[#EF4444]"
              />
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <SectionCard
            title="ترکیب فروش بازار / ناجا"
            description="نمودار دونات برای مقایسه سهم هر گروه در فروش تأییدشده"
          >
            {channelRows.some((row) => row.amount > 0) ? (
              <div className="grid gap-5 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] xl:items-center">
                <DonutChart rows={channelRows} />
                <div className="grid gap-3">
                  {channelRows.map((row) => (
                    <ChannelLegendRow
                      key={row.key}
                      row={row}
                      total={totalSalesAmount}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState message="برای این بازه داده‌ای ثبت نشده است." />
            )}
          </SectionCard>

          <SectionCard
            title="فروش به تفکیک کارشناس"
            description="نمودار و رتبه‌بندی کارشناسان بر اساس مبلغ فروش"
          >
            {expertRows.length ? (
              <div className="grid gap-3">
                {expertRows.map((row) => (
                  <BarRow
                    key={row.key}
                    label={row.label}
                    amount={row.amount}
                    total={maxAmount}
                    meta={`${formatNumber(row.count)} سفارش · ${formatNumber(row.quantity)} قلم`}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="در این بازه فروش ثبت‌شده‌ای برای کارشناسان وجود ندارد." />
            )}
          </SectionCard>
        </section>

        <SectionCard
          title="روند فروش"
          description="نمودار روزانه فروش تأییدشده در بازه انتخابی"
        >
          {trendRows.length ? (
            <div className="grid gap-4">
              {trendRows.map((row) => (
                <TrendChartRow
                  key={row.key}
                  label={row.label}
                  amount={row.amount}
                  count={row.count}
                  total={maxAmount}
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
      </div>
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

function DonutChart({
  rows,
}: {
  rows: Array<{ key: string; label: string; count: number; quantity: number; amount: number }>;
}) {
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const [first, second] = rows;
  const firstRatio = total > 0 ? first.amount / total : 0;
  const secondRatio = total > 0 ? second.amount / total : 0;
  const circumference = 2 * Math.PI * 45;
  const firstDash = firstRatio * circumference;
  const secondDash = secondRatio * circumference;

  return (
    <div className="flex items-center justify-center">
      <div className="relative h-48 w-48 sm:h-52 sm:w-52 lg:h-56 lg:w-56">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="45" fill="none" stroke="#EEF3F8" strokeWidth="14" />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#2C4A73"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${firstDash} ${circumference - firstDash}`}
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
            strokeDasharray={`${secondDash} ${circumference - secondDash}`}
            strokeDashoffset={-firstDash}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-medium text-[#6B7280]">جمع فروش</p>
          <p className="mt-1 text-xl font-black text-[#102034] sm:text-2xl">
            {formatCurrency(total)}
          </p>
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
    <div className="rounded-[18px] border border-[#E6EDF4] bg-white p-3.5 sm:p-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${color}`} />
            <p className="truncate text-sm font-bold text-[#102034]">{row.label}</p>
          </div>
          <p className="mt-2 text-xs leading-6 text-[#6B7280]">
            تعداد سفارش: {formatNumber(row.count)} · تعداد اقلام: {formatNumber(row.quantity)}
          </p>
        </div>
        <div className="text-left sm:min-w-[7rem]">
          <p className="text-sm font-bold text-[#102034] sm:text-base">
            {formatCurrency(row.amount)}
          </p>
          <p className="mt-1 text-xs text-[#6B7280]">{formatNumber(percent)}٪</p>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EEF3F8]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(percent, 8)}%` }} />
      </div>
    </div>
  );
}

function BarRow({
  label,
  amount,
  total,
  meta,
}: {
  label: string;
  amount: number;
  total: number;
  meta: string;
}) {
  const percent = total > 0 ? Math.round((amount / total) * 100) : 0;
  return (
    <div className="rounded-[18px] border border-[#E6EDF4] bg-white p-3.5 sm:p-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#102034]">{label}</p>
          <p className="mt-1 text-xs leading-6 text-[#6B7280]">{meta}</p>
        </div>
        <div className="text-left sm:min-w-[7rem]">
          <p className="text-sm font-bold text-[#102034] sm:text-base">{formatCurrency(amount)}</p>
          <p className="mt-1 text-xs text-[#6B7280]">{formatNumber(percent)}٪</p>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EEF3F8]">
        <div className="h-full rounded-full bg-[#1F3A5F]" style={{ width: `${Math.max(percent, 8)}%` }} />
      </div>
    </div>
  );
}

function TrendChartRow({
  label,
  amount,
  count,
  total,
}: {
  label: string;
  amount: number;
  count: number;
  total: number;
}) {
  const percent = total > 0 ? Math.round((amount / total) * 100) : 0;
  return (
    <div className="grid gap-3 rounded-[18px] border border-[#E6EDF4] bg-white p-4 lg:grid-cols-[10rem_minmax(0,1fr)_8rem] lg:items-center">
      <div>
        <p className="text-sm font-bold text-[#102034]">{label}</p>
        <p className="mt-1 text-xs text-[#6B7280]">{formatNumber(count)} سفارش</p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#EEF3F8]">
        <div className="h-full rounded-full bg-[#6CAE75]" style={{ width: `${Math.max(percent, 8)}%` }} />
      </div>
      <div className="text-left">
        <p className="text-sm font-bold text-[#102034]">{formatCurrency(amount)}</p>
        <p className="mt-1 text-xs text-[#6B7280]">{formatNumber(percent)}٪ از کل</p>
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#E6EDF4] bg-white p-4">
      <p className="text-xs font-medium text-[#6B7280]">{label}</p>
      <p className="mt-2 text-lg font-black text-[#102034]">{value}</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[#E6EDF4] bg-white p-4">
      <div className="flex items-center gap-3">
        <span className={`size-3 rounded-full ${accent}`} />
        <span className="text-sm font-medium text-[#475569]">{label}</span>
      </div>
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
