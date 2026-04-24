"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderSourceBadge } from "@/components/shared/order-source-badge";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/expert/utils";
import { useState } from "react";

export default function FinanceNajaInvoicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getOrderById, getProductById, getInvoiceByOrderId, createInvoice } = useExpertStore();
  const order = getOrderById(params.id);
  const existingInvoice = order ? getInvoiceByOrderId(order.id) : undefined;
  const [message, setMessage] = useState("");

  if (!order || order.orderSource !== "naja") {
    return (
      <DashboardLayout role="finance" title="صدور فاکتور ناجا">
        <EmptyState title="سفارش ناجا یافت نشد" description="این رکورد مربوط به مسیر اختصاصی ناجا نیست." />
      </DashboardLayout>
    );
  }

  const product = getProductById(order.items[0]?.productId ?? "");

  const handleIssue = () => {
    const result = createInvoice({ orderId: order.id, createdBy: "مریم نادری" });
    if (!result.ok || !result.invoice) {
      setMessage(result.error ?? "صدور فاکتور ناجا انجام نشد.");
      return;
    }

    router.push(`/finance/invoices/${result.invoice.id}`);
  };

  return (
    <DashboardLayout role="finance" title="صدور فاکتور ناجا">
      <SectionHeader
        title={`فاکتور ناجا برای ${order.code}`}
        description="این مسیر بدون تطبیق حواله خروج، مستقیما فاکتور را به نام ناجا صادر می کند."
        actions={<OrderSourceBadge source={order.orderSource} />}
      />

      {message ? <div className="asama-banner px-4 py-3 text-sm">{message}</div> : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoItem label="نام صورتحساب" value="ناجا" />
            <InfoItem label="کارشناس ثبت کننده" value={order.najaExpertName ?? "-"} />
            <InfoItem label="نام مشتری" value={order.customerName} />
            <InfoItem label="کد ملی" value={order.nationalId ?? "-"} />
            <InfoItem label="شماره موبایل" value={order.phoneNumber ?? "-"} />
            <InfoItem label="کالا" value={product?.name ?? "-"} />
            <InfoItem label="شناسه کالا" value={order.productIdentifier ?? "-"} />
            <InfoItem label="کد رهگیری" value={order.trackingCode ?? "-"} />
            <InfoItem label="تاریخ ثبت سفارش" value={formatDate(order.createdAt)} />
            <InfoItem label="آخرین تغییر" value={formatDateTime(order.updatedAt)} />
          </div>

          <div className="mt-5 flex gap-2">
            <Button type="button" onClick={handleIssue} disabled={Boolean(existingInvoice)}>
              {existingInvoice ? "فاکتور قبلا صادر شده" : "صدور فاکتور به نام ناجا"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/finance/ready">بازگشت</Link>
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <Badge variant="warning">ضمیمه مشتری ناجا</Badge>
          <p className="mt-4 text-sm leading-7 text-[#6B7280]">
            اطلاعات مشتری، کد ملی، شماره موبایل، شناسه کالا و کد رهگیری به عنوان
            ضمیمه فاکتور ذخیره می شود و نام صورتحساب روی «ناجا» قرار می گیرد.
          </p>
        </Card>
      </section>
    </DashboardLayout>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#FBFCFD] p-3">
      <p className="text-xs text-[#6B7280]">{label}</p>
      <p className="mt-1 text-sm font-medium text-[#1F3A5F]">{value}</p>
    </div>
  );
}
