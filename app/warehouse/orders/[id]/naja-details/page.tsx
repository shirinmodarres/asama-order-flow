"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { NajaReturnAction } from "@/components/naja/naja-return-action";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function WarehouseNajaDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getOrderById, completeNajaWarehouseDetails } = useExpertStore();
  const order = getOrderById(params.id);
  const [productIdentifier, setProductIdentifier] = useState(order?.productIdentifier ?? "");
  const [trackingCode, setTrackingCode] = useState(order?.trackingCode ?? "");
  const [message, setMessage] = useState("");

  if (!order || order.orderSource !== "naja") {
    return (
      <DashboardLayout role="warehouse" title="تکمیل اطلاعات انبار ناجا">
        <EmptyState title="سفارش ناجا یافت نشد" description="این شناسه مربوط به جریان ناجا نیست." />
      </DashboardLayout>
    );
  }

  const handleSubmit = () => {
    const result = completeNajaWarehouseDetails({
      orderId: order.id,
      productIdentifier,
      trackingCode,
      createdBy: "رضا احمدی",
    });

    if (!result.ok) {
      setMessage(result.error ?? "ثبت اطلاعات انبار انجام نشد.");
      return;
    }

    router.push("/finance/ready");
  };

  return (
    <DashboardLayout role="warehouse" title="تکمیل اطلاعات انبار ناجا">
      <SectionHeader
        title={`تکمیل اطلاعات ${order.code}`}
        description="برای سفارش های ناجا، شناسه کالا و کد رهگیری باید قبل از ارسال به مالی ثبت شوند."
        actions={<Badge variant="warning">سفارش ناجا</Badge>}
      />

      {message ? <div className="asama-banner px-4 py-3 text-sm">{message}</div> : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[#334155]">
              <span>شناسه کالا</span>
              <Input value={productIdentifier} onChange={(event) => setProductIdentifier(event.target.value)} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#334155]">
              <span>کد رهگیری</span>
              <Input value={trackingCode} onChange={(event) => setTrackingCode(event.target.value)} />
            </label>
          </div>

          <div className="mt-5 flex gap-2">
            <Button type="button" onClick={handleSubmit}>
              ثبت اطلاعات انبار
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={`/warehouse/orders/${order.id}`}>بازگشت</Link>
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5 text-sm leading-7 text-[#6B7280]">
            <p className="font-semibold text-[#102034]">خلاصه سفارش</p>
            <p className="mt-2">مشتری: {order.customerName}</p>
            <p>ثبت کننده: {order.createdBy}</p>
            <p>کارشناس ناجا: {order.najaExpertName ?? "-"}</p>
          </Card>

          <NajaReturnAction order={order} actorName="رضا احمدی" />
        </div>
      </section>
    </DashboardLayout>
  );
}
