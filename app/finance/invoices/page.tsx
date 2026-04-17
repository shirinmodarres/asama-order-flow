"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { InvoiceStatusBadge } from "@/components/finance/invoice-status-badge";
import { InvoiceTable } from "@/components/finance/invoice-table";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import type { DataTableColumn } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import type { Invoice } from "@/lib/expert/types";
import { formatDateTime } from "@/lib/expert/utils";

interface InvoiceRow {
  id: string;
  invoice: Invoice;
  orderCode: string;
  createdBy: string;
}

export default function FinanceInvoicesPage() {
  const { invoices, getOrderById } = useExpertStore();
  const [search, setSearch] = useState("");

  const rows = useMemo<InvoiceRow[]>(() => {
    return [...invoices]
      .sort((a, b) => Number(new Date(b.issuedAt)) - Number(new Date(a.issuedAt)))
      .map((invoice) => {
        const order = getOrderById(invoice.orderId);
        return {
          id: invoice.id,
          invoice,
          orderCode: order?.code ?? "-",
          createdBy: order?.createdBy ?? "-",
        };
      })
      .filter((row) => {
        const query = search.toLowerCase().trim();
        if (!query) return true;
        return (
          row.invoice.invoiceNumber.toLowerCase().includes(query) ||
          row.orderCode.toLowerCase().includes(query) ||
          row.createdBy.toLowerCase().includes(query)
        );
      });
  }, [invoices, getOrderById, search]);

  const columns: DataTableColumn<InvoiceRow>[] = [
    { key: "invoiceNumber", header: "شماره فاکتور", render: (row) => <span className="font-semibold text-[#1F3A5F]">{row.invoice.invoiceNumber}</span> },
    { key: "orderCode", header: "کد سفارش", render: (row) => row.orderCode },
    { key: "creator", header: "ثبت کننده", render: (row) => row.createdBy },
    { key: "issuedAt", header: "تاریخ صدور", render: (row) => formatDateTime(row.invoice.issuedAt) },
    { key: "status", header: "وضعیت", render: (row) => <InvoiceStatusBadge status={row.invoice.status} /> },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        <Link href={`/finance/invoices/${row.invoice.id}`} className="btn-primary rounded-[12px] px-3 py-1.5 text-xs font-medium text-white visited:text-white hover:text-white focus:text-white">
          مشاهده فاکتور
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout role="finance" title="فاکتورها">
      <SectionHeader title="فاکتورهای صادرشده" description="لیست فاکتورهای داخلی صادرشده برای سفارش های تکمیل شده" />

      <section className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="جستجو بر اساس شماره فاکتور، کد سفارش یا ثبت کننده"
          className="w-full rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#1F3A5F]"
        />
      </section>

      {rows.length > 0 ? (
        <InvoiceTable columns={columns} rows={rows} rowKey={(row) => row.id} />
      ) : (
        <EmptyState title="فاکتوری یافت نشد" description="هنوز فاکتوری صادر نشده یا عبارت جستجو نتیجه ای ندارد." />
      )}
    </DashboardLayout>
  );
}
