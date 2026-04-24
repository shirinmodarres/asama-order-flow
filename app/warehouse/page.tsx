"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { ManagerSummaryCard } from "@/components/manager/manager-summary-card";
import { ActionLinkCard } from "@/components/shared/action-link-card";

export default function WarehousePage() {
  const { orders } = useExpertStore();

  const reviewingCount = orders.filter(
    (order) =>
      order.status === "approved" && order.warehouseStatus === "reviewing",
  ).length;
  const najaPendingCount = orders.filter(
    (order) =>
      order.orderSource === "naja" &&
      order.status === "approved" &&
      order.warehouseStatus === "awaitingNajaDetails",
  ).length;
  const issuedCount = orders.filter(
    (order) => order.warehouseStatus === "dispatchIssued",
  ).length;
  const deliveredCount = orders.filter(
    (order) => order.warehouseStatus === "delivered",
  ).length;

  return (
    <DashboardLayout role="warehouse" title="داشبورد انبار">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ManagerSummaryCard
          title="سفارش های در بررسی انبار"
          value={reviewingCount}
          hint="منتظر صدور حواله خروج"
        />
        <ManagerSummaryCard
          title="سفارش های ناجا"
          value={najaPendingCount}
          hint="منتظر ثبت شناسه کالا و کد رهگیری"
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
        <ActionLinkCard
          href="/warehouse/orders"
          icon="package"
          title="مشاهده سفارش های تاییدشده"
          description="ورود به صف بررسی انبار و آماده سازی خروج"
        />
        <ActionLinkCard
          href="/warehouse/exit-slips"
          icon="truck"
          title="ثبت حواله خروج"
          description="پیگیری حواله های صادرشده و ثبت جزئیات خروج"
        />
        <ActionLinkCard
          href="/warehouse/delivered"
          icon="file-check"
          title="تایید تحویل"
          description="ثبت نهایی دریافت کالا توسط مشتری"
        />
      </section>
    </DashboardLayout>
  );
}
