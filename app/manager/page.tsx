"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { ManagerSummaryCard } from "@/components/manager/manager-summary-card";
import { ActionLinkCard } from "@/components/shared/action-link-card";

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
        <ActionLinkCard
          href="/manager/pending-orders"
          icon="clipboard-check"
          title="بررسی سفارش ها"
          description="مشاهده سفارش های در انتظار تایید و ثبت تصمیم نهایی"
        />
        <ActionLinkCard
          href="/manager/order-tracking"
          icon="activity"
          title="مشاهده روند سفارش ها"
          description="پایش وضعیت کلی سفارش ها از تایید تا فاکتور"
        />
      </section>
    </DashboardLayout>
  );
}
