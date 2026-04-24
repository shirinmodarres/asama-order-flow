"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { InvoiceStatusBadge } from "@/components/finance/invoice-status-badge";
import { InvoiceSummaryCard } from "@/components/finance/invoice-summary-card";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  getOrderLineTotal,
} from "@/lib/expert/utils";

interface InvoiceItemRow {
  id: string;
  name: string;
  brand: string;
  unit: string;
  unitPrice: number;
  quantity: number;
}

export default function FinanceInvoiceDetailsPage() {
  const params = useParams<{ id: string }>();
  const { getInvoiceById, getOrderById, getExitSlipById, getProductById } =
    useExpertStore();

  const invoice = getInvoiceById(params.id);
  if (!invoice) {
    return (
      <DashboardLayout role="finance" title="جزئیات فاکتور">
        <EmptyState
          title="فاکتور یافت نشد"
          description="شناسه فاکتور معتبر نیست یا در داده های نمونه وجود ندارد."
        />
      </DashboardLayout>
    );
  }

  const order = getOrderById(invoice.orderId);
  const slip = invoice.exitSlipId ? getExitSlipById(invoice.exitSlipId) : undefined;

  if (!order || (order.orderSource === "normal" && !slip)) {
    return (
      <DashboardLayout role="finance" title="جزئیات فاکتور">
        <EmptyState
          title="اطلاعات سفارش یا حواله ناقص است"
          description="رکوردهای مرتبط با این فاکتور در دسترس نیست."
        />
      </DashboardLayout>
    );
  }

  const rows: InvoiceItemRow[] = invoice.items.map((item) => {
    const product = getProductById(item.productId);
    return {
      id: item.productId,
      name: product?.name ?? "کالای نامشخص",
      brand: product?.brand ?? "-",
      unit: product?.unit ?? "-",
      unitPrice: product?.unitPrice ?? 0,
      quantity: item.quantity,
    };
  });

  const columns: DataTableColumn<InvoiceItemRow>[] = [
    {
      key: "name",
      header: "قلم کالا",
      render: (row) => (
        <span className="font-medium text-[#1F3A5F]">{row.name}</span>
      ),
    },
    { key: "brand", header: "برند", render: (row) => row.brand },
    { key: "unit", header: "واحد", render: (row) => row.unit },
    {
      key: "unitPrice",
      header: "قیمت واحد",
      render: (row) => formatCurrency(row.unitPrice),
    },
    {
      key: "quantity",
      header: "تعداد",
      render: (row) => formatNumber(row.quantity),
    },
    {
      key: "lineTotal",
      header: "مبلغ",
      render: (row) => formatCurrency(getOrderLineTotal(row.quantity, row.unitPrice)),
    },
  ];

  return (
    <DashboardLayout role="finance" title="جزئیات فاکتور">
      <SectionHeader
        title={`فاکتور ${invoice.invoiceNumber}`}
        description="نمای چاپ محور جزئیات فاکتور صادرشده"
        actions={
          <Link
            href="/finance/invoices"
            className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm text-[#334155] hover:border-[#CBD5E1]"
          >
            بازگشت به لیست
          </Link>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-[#DDE3EB] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E7EB] pb-4">
              <div>
                <p className="text-xs text-[#6B7280]">سند مالی داخلی</p>
                <h3 className="mt-1 text-xl font-bold text-[#1F3A5F]">
                  {invoice.invoiceNumber} {invoice.invoiceName ? `- ${invoice.invoiceName}` : ""}
                </h3>
              </div>
              <InvoiceStatusBadge status={invoice.status} />
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoItem label="کد سفارش مرتبط" value={order.code} />
              <InfoItem label="نام صورتحساب" value={invoice.invoiceName ?? order.customerName} />
              <InfoItem label="مشتری" value={order.customerName} />
              <InfoItem label="شماره حواله خروج" value={slip?.slipNumber ?? "در مسیر ناجا نیاز نیست"} />
              <InfoItem label="ثبت کننده سفارش" value={order.createdBy} />
              <InfoItem label="مسئول صدور فاکتور" value={invoice.createdBy} />
              <InfoItem
                label="تاریخ صدور فاکتور"
                value={formatDateTime(invoice.issuedAt)}
              />
              <InfoItem
                label="تاریخ تحویل"
                value={
                  slip?.deliveredAt
                    ? formatDateTime(slip.deliveredAt)
                    : slip
                      ? formatDate(slip.exitDate)
                      : formatDate(order.updatedAt)
                }
              />
              <InfoItem
                label="وضعیت سفارش"
                value={<StatusBadge type="order" status={order.status} />}
              />
              <InfoItem
                label="وضعیت انبار"
                value={
                  <StatusBadge
                    type="warehouse"
                    status={order.warehouseStatus}
                  />
                }
              />
            </dl>
          </section>

          <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} />

          {invoice.attachmentRecords?.length ? (
            <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-[#1F3A5F]">ضمیمه اطلاعات مشتریان ناجا</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-right text-sm">
                  <thead className="border-b border-[#E9EEF3] bg-[#F8FBFD]">
                    <tr>
                      {["نام مشتری", "کد ملی", "شماره موبایل", "کالا", "شناسه کالا", "کد رهگیری"].map((header) => (
                        <th key={header} className="px-4 py-3 font-semibold text-[#5B6B7F]">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.attachmentRecords.map((record, index) => (
                      <tr key={`${record.nationalId}-${index}`} className="border-b border-[#EEF2F6]">
                        <td className="px-4 py-3">{record.customerName}</td>
                        <td className="px-4 py-3">{record.nationalId}</td>
                        <td className="px-4 py-3">{record.phoneNumber}</td>
                        <td className="px-4 py-3">{record.productName}</td>
                        <td className="px-4 py-3">{record.productIdentifier}</td>
                        <td className="px-4 py-3">{record.trackingCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </div>

        <InvoiceSummaryCard
          invoice={invoice}
          warehouseStatus={order.warehouseStatus}
        />
      </section>
    </DashboardLayout>
  );
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#FBFCFD] p-3">
      <dt className="text-xs text-[#6B7280]">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[#1F3A5F]">{value}</dd>
    </div>
  );
}
