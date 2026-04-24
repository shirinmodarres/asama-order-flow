"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { ManagerSummaryCard } from "@/components/manager/manager-summary-card";
import { SupportActionCard } from "@/components/support/support-action-card";
import { getAvailableStock } from "@/lib/expert/utils";

export default function SupportPage() {
  const { products, orders } = useExpertStore();

  const lowStockCount = products.filter(
    (product) =>
      getAvailableStock(product) <=
      Math.max(5, Math.floor(product.totalStock * 0.2)),
  ).length;
  const orderNeedsEditCount = orders.filter(
    (order) => order.status === "pending" || order.status === "approved",
  ).length;
  const najaInventoryCount = products.filter((product) => product.najaInventoryQty > 0).length;

  return (
    <DashboardLayout role="support" title="داشبورد پشتیبانی">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ManagerSummaryCard
          title="تعداد کالاها"
          value={products.length}
          hint="اقلام تعریف شده در سیستم"
        />
        <ManagerSummaryCard
          title="کالاهای کم موجودی"
          value={lowStockCount}
          hint="نیازمند توجه برای به روزرسانی"
        />
        <ManagerSummaryCard
          title="سفارش های نیازمند اصلاح"
          value={orderNeedsEditCount}
          hint="برای ویرایش ویژه قابل بررسی"
        />
        <ManagerSummaryCard
          title="اقلام دارای موجودی ناجا"
          value={najaInventoryCount}
          hint="کالاهای قابل ثبت در مسیر ناجا"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SupportActionCard
          title="تعریف کالا"
          description="ثبت کالاهای جدید و تکمیل اطلاعات پایه"
          href="/support/products/new"
        />
        <SupportActionCard
          title="ثبت موجودی"
          description="افزایش یا کاهش کنترل شده موجودی انبار"
          href="/support/inventory"
        />
        <SupportActionCard
          title="ویرایش سفارش"
          description="ثبت ویرایش ویژه پشتیبانی خارج از روند عادی"
          href="/support/orders"
        />
        <SupportActionCard
          title="موجودی ناجا"
          description="تعریف و به روزرسانی موجودی اختصاصی سفارش های ناجا"
          href="/support/naja-inventory"
        />
      </section>
    </DashboardLayout>
  );
}
