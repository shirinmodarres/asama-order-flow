"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SectionHeader } from "@/components/shared/section-header";
import { ManagerSummaryCard } from "@/components/manager/manager-summary-card";
import { SupportActionCard } from "@/components/support/support-action-card";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { getAvailableStock } from "@/lib/expert/utils";

export default function SupportPage() {
  const { products, orders, inventoryHistory } = useExpertStore();

  const lowStockCount = products.filter((product) => getAvailableStock(product) <= Math.max(5, Math.floor(product.totalStock * 0.2))).length;
  const orderNeedsEditCount = orders.filter((order) => order.status === "pending" || order.status === "approved").length;

  return (
    <DashboardLayout role="support" title="داشبورد پشتیبانی">
      <SectionHeader title="نمای عملیاتی داده های پایه" description="مدیریت کالا، موجودی و ویرایش های ویژه سفارش" />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ManagerSummaryCard title="تعداد کالاها" value={products.length} hint="اقلام تعریف شده در سیستم" />
        <ManagerSummaryCard title="کالاهای کم موجودی" value={lowStockCount} hint="نیازمند توجه برای به روزرسانی" />
        <ManagerSummaryCard title="سفارش های نیازمند اصلاح" value={orderNeedsEditCount} hint="برای ویرایش ویژه قابل بررسی" />
        <ManagerSummaryCard title="آخرین تغییرات موجودی" value={inventoryHistory.length} hint="تعداد کل ثبت های تاریخچه" />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SupportActionCard title="تعریف کالا" description="ثبت کالاهای جدید و تکمیل اطلاعات پایه" href="/support/products/new" />
        <SupportActionCard title="ثبت موجودی" description="افزایش یا کاهش کنترل شده موجودی انبار" href="/support/inventory" />
        <SupportActionCard title="ویرایش سفارش" description="ثبت ویرایش ویژه پشتیبانی خارج از روند عادی" href="/support/orders" />
      </section>
    </DashboardLayout>
  );
}
