"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { ManagerSummaryCard } from "@/components/manager/manager-summary-card";
import { SectionHeader } from "@/components/shared/section-header";

export default function FinancePage() {
  const { orders, invoices, exitSlips } = useExpertStore();

  const readyForInvoiceCount = orders.filter(
    (order) =>
      order.status === "approved" && order.warehouseStatus === "delivered",
  ).length;
  const issuedInvoicesCount = invoices.length;
  const completedOrdersCount = orders.filter(
    (order) =>
      order.warehouseStatus === "delivered" || order.status === "invoiced",
  ).length;
  const reconciliableCount = orders.filter(
    (order) =>
      order.status === "approved" &&
      order.warehouseStatus === "delivered" &&
      exitSlips.some((slip) => slip.orderId === order.id),
  ).length;

  return (
    <DashboardLayout role="finance" title="داشبورد حسابداری">
      <SectionHeader
        title="نمای مالی و صدور فاکتور"
        description="پایش سفارش های آماده فاکتور و نهایی سازی مالی بر اساس تحویل تاییدشده"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ManagerSummaryCard
          title="سفارش های آماده فاکتور"
          value={readyForInvoiceCount}
          hint="تایید فروش و تحویل انبار تکمیل شده است"
        />
        <ManagerSummaryCard
          title="فاکتورهای صادرشده"
          value={issuedInvoicesCount}
          hint="ثبت شده در چرخه داخلی مالی"
        />
        <ManagerSummaryCard
          title="مجموع سفارش های تکمیل شده"
          value={completedOrdersCount}
          hint="تحویل تاییدشده یا فاکتور صادرشده"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href="/finance/ready"
          className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm hover:border-[#CBD5E1]"
        >
          <h3 className="text-base font-semibold text-[#1F3A5F]">
            مشاهده سفارش های آماده فاکتور
          </h3>
          <p className="mt-2 text-sm text-[#6B7280]">
            صف سفارش هایی که آماده بررسی و صدور فاکتور هستند
          </p>
        </Link>

        <Link
          href="/finance/ready"
          className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm hover:border-[#CBD5E1]"
        >
          <h3 className="text-base font-semibold text-[#1F3A5F]">
            بررسی تطبیق سفارش و حواله
          </h3>
          <p className="mt-2 text-sm text-[#6B7280]">{`تعداد ${reconciliableCount.toLocaleString("fa-IR")} سفارش قابل تطبیق`}</p>
        </Link>

        <Link
          href="/finance/invoices"
          className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm hover:border-[#CBD5E1]"
        >
          <h3 className="text-base font-semibold text-[#1F3A5F]">
            مشاهده فاکتورها
          </h3>
          <p className="mt-2 text-sm text-[#6B7280]">
            دسترسی به لیست و جزئیات فاکتورهای صادرشده
          </p>
        </Link>
      </section>
    </DashboardLayout>
  );
}
