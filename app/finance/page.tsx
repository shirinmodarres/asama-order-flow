"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { ManagerSummaryCard } from "@/components/manager/manager-summary-card";
import { ActionLinkCard } from "@/components/shared/action-link-card";

export default function FinancePage() {
  const { orders, invoices, exitSlips } = useExpertStore();

  const readyForInvoiceCount = orders.filter(
    (order) =>
      (order.orderSource === "normal" &&
        order.status === "approved" &&
        order.warehouseStatus === "delivered") ||
      (order.orderSource === "naja" &&
        order.status === "approved" &&
        order.warehouseStatus === "najaDetailsCompleted"),
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
      order.orderSource === "normal" &&
      exitSlips.some((slip) => slip.orderId === order.id),
  ).length;

  return (
    <DashboardLayout role="finance" title="داشبورد حسابداری">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ManagerSummaryCard
          title="سفارش های آماده فاکتور"
          value={readyForInvoiceCount}
          hint="شامل جریان عادی و سفارش های ناجا"
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
        <ActionLinkCard
          href="/finance/ready"
          icon="layers"
          title="مشاهده سفارش های آماده فاکتور"
          description="صف سفارش هایی که آماده بررسی و صدور فاکتور اند"
        />
        <ActionLinkCard
          href="/finance/ready"
          icon="file-check"
          title="بررسی تطبیق سفارش و حواله"
          description={`تعداد ${reconciliableCount.toLocaleString("fa-IR")} سفارش قابل تطبیق`}
        />
        <ActionLinkCard
          href="/finance/invoices"
          icon="file-text"
          title="مشاهده فاکتورها"
          description="دسترسی به لیست و جزئیات فاکتورهای صادرشده"
        />
      </section>
    </DashboardLayout>
  );
}
