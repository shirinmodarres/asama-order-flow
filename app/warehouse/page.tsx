"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SectionHeader } from "@/components/shared/section-header";
import { ManagerSummaryCard } from "@/components/manager/manager-summary-card";
import { useExpertStore } from "@/components/expert/expert-store-provider";

export default function WarehousePage() {
  const { orders } = useExpertStore();

  const reviewingCount = orders.filter(
    (order) =>
      order.status === "approved" && order.warehouseStatus === "reviewing",
  ).length;
  const issuedCount = orders.filter(
    (order) => order.warehouseStatus === "dispatchIssued",
  ).length;
  const deliveredCount = orders.filter(
    (order) => order.warehouseStatus === "delivered",
  ).length;

  return (
    <DashboardLayout role="warehouse" title="داشبورد انبار">
      <SectionHeader
        title="نمای عملیاتی انبار"
        description="پایش سفارش های تاییدشده، حواله ها و تحویل نهایی"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <ManagerSummaryCard
          title="سفارش های در بررسی انبار"
          value={reviewingCount}
          hint="منتظر صدور حواله خروج"
        />
        <ManagerSummaryCard
          title="حواله های خروج صادرشده"
          value={issuedCount}
          hint="در مسیر تحویل به مشتری"
        />
        <ManagerSummaryCard
          title="سفارش های تحویل شده"
          value={deliveredCount}
          hint="تحویل نهایی تایید شده"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href="/warehouse/orders"
          className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm hover:border-[#CBD5E1]"
        >
          <h3 className="text-base font-semibold text-[#1F3A5F]">
            مشاهده سفارش های تاییدشده
          </h3>
          <p className="mt-2 text-sm text-[#6B7280]">
            ورود به صف بررسی انبار و آماده سازی خروج
          </p>
        </Link>

        <Link
          href="/warehouse/exit-slips"
          className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm hover:border-[#CBD5E1]"
        >
          <h3 className="text-base font-semibold text-[#1F3A5F]">
            ثبت حواله خروج
          </h3>
          <p className="mt-2 text-sm text-[#6B7280]">
            پیگیری حواله های صادرشده و ثبت جزئیات خروج
          </p>
        </Link>

        <Link
          href="/warehouse/delivered"
          className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm hover:border-[#CBD5E1]"
        >
          <h3 className="text-base font-semibold text-[#1F3A5F]">
            تایید تحویل
          </h3>
          <p className="mt-2 text-sm text-[#6B7280]">
            ثبت نهایی دریافت کالا توسط مشتری
          </p>
        </Link>
      </section>
    </DashboardLayout>
  );
}
