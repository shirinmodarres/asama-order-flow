"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { FinanceActionPanel } from "@/components/finance/finance-action-panel";
import { InvoiceSummaryCard } from "@/components/finance/invoice-summary-card";
import { OrderVsSlipComparison } from "@/components/finance/order-vs-slip-comparison";
import { ConfirmationModal } from "@/components/manager/confirmation-modal";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import {
  formatCurrency,
  formatNumber,
  getOrderItemCount,
  getOrderTotalAmount,
  getOrderTotalQuantity,
} from "@/lib/expert/utils";

export default function FinanceReconciliationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    getOrderById,
    getExitSlipByOrderId,
    getInvoiceByOrderId,
    getProductById,
    createInvoice,
  } = useExpertStore();

  const [message, setMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const order = getOrderById(params.id);
  const slip = order ? getExitSlipByOrderId(order.id) : undefined;
  const existingInvoice = order ? getInvoiceByOrderId(order.id) : undefined;

  const productsById = useMemo(() => {
    if (!order) return {};

    return order.items.reduce<
      Record<string, ReturnType<typeof getProductById>>
    >((accumulator, item) => {
      accumulator[item.productId] = getProductById(item.productId);
      return accumulator;
    }, {});
  }, [order, getProductById]);
  const totalAmount = order
    ? getOrderTotalAmount(order.items, productsById)
    : 0;

  if (!order) {
    return (
      <DashboardLayout role="finance" title="تطبیق سفارش و حواله">
        <EmptyState
          title="سفارش یافت نشد"
          description="شناسه سفارش معتبر نیست یا در داده های نمونه وجود ندارد."
        />
      </DashboardLayout>
    );
  }

  if (!slip) {
    return (
      <DashboardLayout role="finance" title="تطبیق سفارش و حواله">
        <EmptyState
          title="حواله خروج یافت نشد"
          description="بدون حواله خروج امکان تطبیق مالی و صدور فاکتور وجود ندارد."
        />
      </DashboardLayout>
    );
  }

  const canIssueInvoice =
    order.status === "approved" &&
    order.warehouseStatus === "delivered" &&
    !existingInvoice;
  const disabledReason = existingInvoice
    ? "برای این سفارش فاکتور صادر شده است."
    : "صدور فاکتور فقط برای سفارش تاییدشده با تحویل تاییدشده ممکن است.";

  const handleIssueInvoice = () => {
    const result = createInvoice({
      orderId: order.id,
      createdBy: "مریم نادری",
    });

    if (!result.ok || !result.invoice) {
      setMessage(result.error ?? "صدور فاکتور انجام نشد.");
      setConfirmOpen(false);
      return;
    }

    setMessage(result.message ?? "فاکتور با موفقیت صادر شد.");
    setConfirmOpen(false);
    router.push(`/finance/invoices/${result.invoice.id}`);
  };

  return (
    <DashboardLayout role="finance" title="تطبیق سفارش و حواله">
      <SectionHeader
        title={`تطبیق مالی ${order.code}`}
        description="مقایسه اطلاعات سفارش و حواله خروج پیش از نهایی سازی مالی"
        actions={
          <Link
            href="/finance/ready"
            className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm text-[#334155] hover:border-[#CBD5E1]"
          >
            بازگشت به لیست
          </Link>
        }
      />

      {message ? (
        <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-3 text-sm text-[#4D7D54]">
          {message}
        </div>
      ) : null}

      <section className="rounded-xl border border-[#D6E4D8] bg-[#F7FBF8] p-4 text-sm text-[#35593B]">
        این مرحله تایید می کند اقلام تحویل شده در فرآیند انبار، برای نهایی سازی
        مالی آماده هستند و با صدور فاکتور وضعیت سفارش به فاکتور شده تغییر می
        کند.
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <OrderVsSlipComparison
            order={order}
            slip={slip}
            productsById={productsById}
          />

          <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-[#1F3A5F]">
              خلاصه تطبیق
            </h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <SummaryItem
                label="تعداد اقلام"
                value={formatNumber(getOrderItemCount(order.items))}
              />
              <SummaryItem
                label="جمع تعداد"
                value={formatNumber(getOrderTotalQuantity(order.items))}
              />
              <SummaryItem
                label="جمع مبلغ"
                value={formatCurrency(totalAmount)}
              />
              <SummaryItem
                label="وضعیت فعلی سفارش"
                value={order.status === "approved" ? "تایید شده" : "فاکتور شده"}
              />
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <InvoiceSummaryCard
            invoice={existingInvoice}
            warehouseStatus={order.warehouseStatus}
          />
          <FinanceActionPanel
            disabled={!canIssueInvoice}
            disabledReason={disabledReason}
            onIssueInvoice={() => setConfirmOpen(true)}
          />
        </div>
      </section>

      <ConfirmationModal
        open={confirmOpen}
        title="صدور فاکتور"
        message="پس از صدور فاکتور، وضعیت سفارش به «فاکتور شده» تغییر می کند. آیا ادامه می دهید؟"
        confirmText="صدور فاکتور"
        tone="success"
        onConfirm={handleIssueInvoice}
        onCancel={() => setConfirmOpen(false)}
      />
    </DashboardLayout>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#FBFCFD] px-3 py-2">
      <p className="text-xs text-[#6B7280]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#1F3A5F]">{value}</p>
    </div>
  );
}
