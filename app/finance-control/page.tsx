"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ClipboardList, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { LoadingState } from "@/components/shared/loading-state";
import { SectionHeader } from "@/components/shared/section-header";
import { Card } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api/api-error";
import type { Order } from "@/lib/models/order.model";
import { listOrders } from "@/lib/services/order.service";
import { formatFaDigits } from "@/lib/utils/number-format";

export default function FinancialControlDashboardPage() {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [returnedOrders, setReturnedOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError("");

      try {
        const [pending, needsCorrection] = await Promise.all([
          listOrders({ financialApprovalStatus: "pending" }),
          listOrders({ financialApprovalStatus: "needs_correction" }),
        ]);

        if (!mounted) return;
        setPendingOrders(pending);
        setReturnedOrders(needsCorrection);
      } catch (loadError) {
        if (mounted) setError(getErrorMessage(loadError));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const pendingItemCount = pendingOrders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    );
    const correctionItemCount = returnedOrders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    );
    return {
      pendingOrderCount: pendingOrders.length,
      correctionOrderCount: returnedOrders.length,
      pendingItemCount,
      correctionItemCount,
    };
  }, [pendingOrders, returnedOrders]);

  return (
    <DashboardLayout role="finance-control" title="کنترل مالی سفارش‌ها">
      <SectionHeader
        title="کنترل مالی سفارش‌ها"
        description="سفارش‌های در انتظار بررسی مالی و برگشت برای اصلاح"
      />

      {isLoading ? <LoadingState title="در حال دریافت وضعیت کنترل مالی" /> : null}
      {error ? (
        <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#B91C1C]">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="سفارش‌های در انتظار"
          value={formatFaDigits(summary.pendingOrderCount)}
          icon={<ClipboardList className="size-5" />}
          description={`${formatFaDigits(summary.pendingItemCount)} آیتم`}
        />
        <MetricCard
          title="در انتظار اصلاح"
          value={formatFaDigits(summary.correctionOrderCount)}
          icon={<AlertTriangle className="size-5" />}
          description={`${formatFaDigits(summary.correctionItemCount)} آیتم`}
          tone="warning"
        />
        <MetricCard
          title="کل سفارش‌های بررسی‌شده"
          value={formatFaDigits(summary.pendingOrderCount + summary.correctionOrderCount)}
          icon={<CheckCircle2 className="size-5" />}
          description="فقط سفارش‌های مالی"
        />
        <Card className="border-[#E5E7EB] p-5">
          <h3 className="text-base font-semibold text-[#1F3A5F]">میان‌برها</h3>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/finance-control/orders"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1F3A5F] px-4 py-2 text-sm font-semibold text-white hover:text-white"
            >
              <RefreshCw className="size-4" />
              بررسی سفارش‌ها
            </Link>
            <p className="text-sm leading-7 text-[#64748B]">
              سفارش‌های مالی را مرور کنید و موارد نیازمند اصلاح را به کارشناس برگردانید.
            </p>
          </div>
        </Card>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-[#E5E7EB] p-5">
          <h3 className="text-base font-semibold text-[#1F3A5F]">سفارش‌ها</h3>
          <p className="mt-2 text-sm leading-7 text-[#64748B]">
            سفارش‌های منتظر تأیید مالی را بررسی کنید و در صورت نیاز برای اصلاح برگردانید.
          </p>
          <Link
            href="/finance-control/orders"
            className="mt-4 inline-flex rounded-xl bg-[#1F3A5F] px-4 py-2 text-sm font-semibold text-white hover:text-white"
          >
            مشاهده سفارش‌ها
          </Link>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({
  title,
  value,
  icon,
  description,
  tone = "default",
}: {
  title: string;
  value: string;
  icon: ReactNode;
  description: string;
  tone?: "default" | "warning";
}) {
  return (
    <Card
      className={
        tone === "warning"
          ? "border-[#F8D9A0] bg-[#FFF9EF] p-5"
          : "border-[#E5E7EB] p-5"
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-[#64748B]">{title}</h3>
          <p className="mt-3 text-2xl font-semibold text-[#1F3A5F]">{value}</p>
          <p className="mt-2 text-sm leading-7 text-[#64748B]">{description}</p>
        </div>
        <div
          className={
            tone === "warning"
              ? "rounded-2xl bg-[#FFEDD5] p-3 text-[#C2410C]"
              : "rounded-2xl bg-[#EEF2FF] p-3 text-[#1F3A5F]"
          }
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
