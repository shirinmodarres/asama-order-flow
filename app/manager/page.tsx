"use client";

import { ClipboardList, Package, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DateRangeFilter, type DateRangeValue } from "@/components/shared/date-range-filter";
import { InlineErrorMessage } from "@/components/shared/inline-error-message";
import { Card } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api/api-error";
import type { Order } from "@/lib/models/order.model";
import {
  getOrderTotalAmount as getSalesTotalAmount,
  getOrderTotalQuantity as getSalesTotalQuantity,
} from "@/lib/reports/order-sales-metrics";
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
    (sum, order) => sum + getSalesTotalAmount(order.items),
    0,
  );
  const totalSalesQuantity = approvedOrders.reduce(
    (sum, order) => sum + getSalesTotalQuantity(order.items),
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

        <section className="rounded-[26px] border border-[#DDE7F0] bg-white px-4 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:px-5 lg:px-6">
          <div className="flex flex-col gap-3 border-b border-[#E7EDF4] pb-5 text-right">
            <h1 className="text-2xl font-black text-[#102034] sm:text-3xl">
              مبلغ کل فروش
            </h1>
            <p className="text-base font-medium text-[#6B7280]">
              جمع فروش قطعی در بازه انتخابی
            </p>
          </div>
          <div className="mt-5 max-w-xl">
            <DateRangeFilter
              value={dateRange}
              onChange={setDateRange}
              label="بازه گزارش"
              placeholder="کل گزارش"
            />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-4">
          <ManagerMetricCard
            title="مبلغ کل فروش"
            value={formatCurrency(totalSalesAmount)}
            icon={<Wallet className="size-6" />}
            iconTone="green"
            footer="ریال"
          />
          <ManagerMetricCard
            title="تعداد سفارش‌های تأیید شده"
            value={formatNumber(approvedOrders.length)}
            icon={<ClipboardList className="size-6" />}
            iconTone="blue"
            footer="سفارش"
          />
          <ManagerMetricCard
            title="تعداد اقلام"
            value={formatNumber(totalSalesQuantity)}
            icon={<Package className="size-6" />}
            iconTone="amber"
            footer="قلم"
          />
          <ManagerMetricCard
            title="میانگین مبلغ سفارش"
            value={formatCurrency(averageOrderAmount)}
            icon={<TrendingUp className="size-6" />}
            iconTone="green"
            footer="ریال"
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <Card className="overflow-hidden rounded-[28px] border border-[#DDE7F0] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="border-b border-[#E7EDF4] px-5 py-5 text-right sm:px-6">
              <h2 className="text-2xl font-black text-[#102034]">
                فروش به تفکیک کارشناس
              </h2>
              <p className="mt-2 text-base font-medium text-[#6B7280]">
                نمودار رتبه‌بندی کارشناسان بر اساس مبلغ فروش
              </p>
            </div>
            <div className="p-5 sm:p-6">
              {expertRows.length ? (
                <div className="overflow-hidden rounded-[24px] border border-[#E6EDF4] bg-[#FCFDFE]">
                  <div className="grid grid-cols-[minmax(0,1.25fr)_7rem_9rem] border-b border-[#E6EDF4] px-4 py-4 text-sm font-bold text-[#102034] sm:px-5">
                    <div>کارشناس</div>
                    <div className="text-center">تعداد سفارش</div>
                    <div className="text-left">مبلغ فروش (ریال)</div>
                  </div>
                  <div className="divide-y divide-[#E6EDF4]">
                    {expertRows.map((row, index) => (
                      <div
                        key={row.key}
                        className="grid grid-cols-[minmax(0,1.25fr)_7rem_9rem] items-center gap-3 px-4 py-5 sm:px-5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white ${rankColor(index)}`}
                          >
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#102034] sm:text-[15px]">
                              {row.label}
                            </p>
                            <p className="mt-1 text-xs text-[#6B7280]">
                              {formatNumber(row.quantity)} قلم
                            </p>
                          </div>
                        </div>
                        <div className="text-center text-sm font-medium text-[#334155]">
                          {formatNumber(row.count)} سفارش
                        </div>
                        <div className="text-left text-sm font-black text-[#102034] sm:text-base">
                          {formatCurrency(row.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState message="در این بازه فروش ثبت‌شده‌ای برای کارشناسان وجود ندارد." />
              )}
            </div>
          </Card>

          <Card className="overflow-hidden rounded-[28px] border border-[#DDE7F0] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="border-b border-[#E7EDF4] px-5 py-5 text-right sm:px-6">
              <h2 className="text-2xl font-black text-[#102034]">
                ترکیب فروش بازار / ناجا
              </h2>
              <p className="mt-2 text-base font-medium text-[#6B7280]">
                نمودار دونات برای مقایسه سهم هر گروه در فروش
              </p>
            </div>
            <div className="p-5 sm:p-6">
              {channelRows.some((row) => row.amount > 0) ? (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,1fr)] xl:items-center">
                  <DonutChart rows={channelRows} total={totalSalesAmount} />
                  <div className="grid gap-4">
                    {channelRows.map((row) => (
                      <ChannelLegendCard
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
            </div>
          </Card>
        </section>

        <Card className="overflow-hidden rounded-[28px] border border-[#DDE7F0] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="border-b border-[#E7EDF4] px-5 py-5 text-right sm:px-6">
            <h2 className="text-2xl font-black text-[#102034]">روند فروش</h2>
            <p className="mt-2 text-base font-medium text-[#6B7280]">
              نمودار روزانه فروش تأییدشده در بازه انتخابی
            </p>
          </div>
          <div className="p-5 sm:p-6">
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
          </div>
        </Card>
      </div>
    </DashboardLayout>
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
    current.quantity += getSalesTotalQuantity(order.items);
    current.amount += getSalesTotalAmount(order.items);
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
    target.quantity += getSalesTotalQuantity(order.items);
    target.amount += getSalesTotalAmount(order.items);
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
    current.quantity += getSalesTotalQuantity(order.items);
    current.amount += getSalesTotalAmount(order.items);
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
  total,
}: {
  rows: Array<{ key: string; label: string; count: number; quantity: number; amount: number }>;
  total: number;
}) {
  const [first, second] = rows;
  const firstRatio = total > 0 ? first.amount / total : 0;
  const secondRatio = total > 0 ? second.amount / total : 0;
  const circumference = 2 * Math.PI * 45;
  const firstDash = firstRatio * circumference;
  const secondDash = secondRatio * circumference;

  return (
    <div className="flex items-center justify-center">
      <div className="relative h-56 w-56 sm:h-60 sm:w-60 lg:h-64 lg:w-64">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="45" fill="none" stroke="#EEF3F8" strokeWidth="15" />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#2C4A73"
            strokeWidth="15"
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
            strokeWidth="15"
            strokeLinecap="round"
            strokeDasharray={`${secondDash} ${circumference - secondDash}`}
            strokeDashoffset={-firstDash}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[12px] font-medium text-[#6B7280]">مبلغ کل فروش</p>
          <p className="mt-2 text-2xl font-black text-[#102034] sm:text-[2rem]">
            {formatCurrency(total)}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChannelLegendCard({
  row,
  total,
}: {
  row: { key: string; label: string; count: number; quantity: number; amount: number };
  total: number;
}) {
  const percent = total > 0 ? Math.round((row.amount / total) * 100) : 0;
  const color = row.key === "naja" ? "bg-[#6CAE75]" : "bg-[#2C4A73]";

  return (
    <div className="rounded-[18px] border border-[#E6EDF4] bg-[#FCFDFE] p-4">
      <div className="flex items-start justify-between gap-4">
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
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(percent, 8)}%` }} />
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#D7E1EA] bg-[#FBFCFE] px-5 py-8 text-center text-sm text-[#6B7280]">
      {message}
    </div>
  );
}

function ManagerMetricCard({
  title,
  value,
  footer,
  icon,
  iconTone,
}: {
  title: string;
  value: string;
  footer: string;
  icon: React.ReactNode;
  iconTone: "green" | "blue" | "amber";
}) {
  const toneStyles =
    iconTone === "blue"
      ? "bg-[#E8F1FF] text-[#3B82F6]"
      : iconTone === "amber"
        ? "bg-[#FFF2DF] text-[#F59E0B]"
        : "bg-[#E7F7EA] text-[#6CAE75]";

  return (
    <Card className="rounded-[24px] border border-[#DDE7F0] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-4">
        <span className={`flex size-12 shrink-0 items-center justify-center rounded-full ${toneStyles}`}>
          {icon}
        </span>
        <div className="min-w-0 flex-1 text-right">
          <p className="text-sm font-semibold text-[#6B7280]">{title}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-[#102034] sm:text-[2rem]">
            {value}
          </p>
          <p className="mt-1 text-sm font-medium text-[#6B7280]">{footer}</p>
        </div>
      </div>
    </Card>
  );
}

function rankColor(index: number): string {
  const palette = [
    "bg-[#6CAE75]",
    "bg-[#8CB8E8]",
    "bg-[#F1B975]",
    "bg-[#A78BFA]",
    "bg-[#F472B6]",
    "bg-[#94A3B8]",
  ];
  return palette[index] ?? "bg-[#94A3B8]";
}
