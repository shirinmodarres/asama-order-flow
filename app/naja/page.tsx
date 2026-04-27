"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { SectionCard } from "@/components/ui/section-card";
import { SummaryCard } from "@/components/ui/summary-card";
import { Badge } from "@/components/ui/badge";
import { OrderSourceBadge } from "@/components/shared/order-source-badge";
import { formatDateTime } from "@/lib/expert/utils";

export default function NajaDashboardPage() {
  const { orders } = useExpertStore();
  const najaOrders = orders.filter((order) => order.orderSource === "naja");
  const awaitingWarehouse = najaOrders.filter(
    (order) => order.status === "approved" && order.warehouseStatus === "awaitingNajaDetails",
  ).length;
  const returnedOrders = najaOrders.filter(
    (order) => order.status === "returned" || order.status === "returnedAfterInvoice",
  ).length;
  const invoicedOrders = najaOrders.filter((order) => order.status === "invoiced").length;
  const latestOrders = [...najaOrders]
    .sort((a, b) => Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt)))
    .slice(0, 4);

  return (
    <DashboardLayout role="naja" title="داشبورد کارشناس ناجا">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="تعداد سفارش های ثبت شده" value={String(najaOrders.length)} hint="کل سفارش های جریان اختصاصی ناجا" />
        <SummaryCard label="سفارش های در انتظار انبار" value={String(awaitingWarehouse)} hint="منتظر تکمیل شناسه کالا و کد رهگیری" />
        <SummaryCard label="سفارش های برگشتی" value={String(returnedOrders)} hint="در هر مرحله بازگردانی شده اند" />
        <SummaryCard label="سفارش های فاکتور شده" value={String(invoicedOrders)} hint="فاکتور صادرشده به نام ناجا" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <SectionCard title="آخرین سفارش های ناجا" description="مرور سریع آخرین سفارش های ثبت شده و برگشتی">
          <div className="space-y-3">
            {latestOrders.map((order) => (
              <div key={order.id} className="rounded-[18px] border border-[#E7EDF3] bg-[#FBFCFD] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#102034]">{order.code}</p>
                      <OrderSourceBadge source={order.orderSource} />
                    </div>
                    <p className="mt-1 text-sm text-[#6B7280]">{order.customerName}</p>
                  </div>
                  <Badge variant="neutral">{formatDateTime(order.updatedAt)}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-[#6B7280]">ثبت کننده: {order.createdBy}</p>
                  <Link href={`/naja/orders/${order.id}`} className="rounded-xl border border-[#E5E7EB] px-3 py-1.5 text-xs text-[#334155]">
                    مشاهده جزئیات
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="دسترسی سریع" description="شروع ثبت سفارش یا مشاهده لیست کامل ناجا">
          <div className="space-y-3">
            <Link href="/naja/orders/new" className="block rounded-[18px] border border-[#DDEAE0] bg-[linear-gradient(180deg,rgba(247,251,248,1),rgba(255,255,255,1))] p-4 text-sm font-semibold text-[#102034]">
              ثبت سفارش ناجا
              <p className="mt-1 text-sm font-normal leading-7 text-[#6B7280]">ایجاد سفارش جدید از موجودی اختصاصی ناجا</p>
            </Link>
            <Link href="/naja/orders" className="block rounded-[18px] border border-[#E7EDF3] bg-white p-4 text-sm font-semibold text-[#102034]">
              سفارش های ناجا
              <p className="mt-1 text-sm font-normal leading-7 text-[#6B7280]">پیگیری، مشاهده جزئیات و بازگردانی سفارش ها</p>
            </Link>
          </div>
        </SectionCard>
      </section>
    </DashboardLayout>
  );
}
