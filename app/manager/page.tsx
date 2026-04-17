"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { ManagerSummaryCard } from "@/components/manager/manager-summary-card";
import { SectionHeader } from "@/components/shared/section-header";

export default function ManagerPage() {
  const { orders } = useExpertStore();

  const pendingCount = orders.filter(
    (order) => order.status === "pending",
  ).length;
  const approvedCount = orders.filter(
    (order) => order.status === "approved",
  ).length;
  const cancelledCount = orders.filter(
    (order) => order.status === "cancelled",
  ).length;
  const warehouseInProgressCount = orders.filter((order) =>
    ["reviewing", "processing", "dispatchIssued"].includes(
      order.warehouseStatus,
    ),
  ).length;

  return (
    <DashboardLayout role="manager" title="داشبورد مدیر فروش">
      <SectionHeader
        title="نمای کلی تصمیم گیری سفارش ها"
        description="پایش سفارش های منتظر تایید و روند پردازش پس از تصمیم"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ManagerSummaryCard
          title="سفارش های در انتظار تایید"
          value={pendingCount}
          hint="نیازمند اقدام سریع مدیر فروش"
        />
        <ManagerSummaryCard
          title="سفارش های تایید شده"
          value={approvedCount}
          hint="منتقل شده به فرآیند انبار"
        />
        <ManagerSummaryCard
          title="سفارش های لغوشده"
          value={cancelledCount}
          hint="رزرو موجودی آن ها آزاد شده است"
        />
        <ManagerSummaryCard
          title="سفارش های در جریان انبار"
          value={warehouseInProgressCount}
          hint="در بررسی، آماده سازی یا خروج"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/manager/pending-orders"
          className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm hover:border-[#CBD5E1]"
        >
          <h3 className="text-base font-semibold text-[#1F3A5F]">
            بررسی سفارش ها
          </h3>
          <p className="mt-2 text-sm text-[#6B7280]">
            مشاهده سفارش های در انتظار تایید و ثبت تصمیم نهایی
          </p>
        </Link>

        <Link
          href="/manager/order-tracking"
          className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm hover:border-[#CBD5E1]"
        >
          <h3 className="text-base font-semibold text-[#1F3A5F]">
            مشاهده روند سفارش ها
          </h3>
          <p className="mt-2 text-sm text-[#6B7280]">
            پایش وضعیت کلی سفارش ها از تایید تا فاکتور
          </p>
        </Link>
      </section>
    </DashboardLayout>
  );
}
