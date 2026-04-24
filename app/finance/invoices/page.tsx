"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { InvoiceStatusBadge } from "@/components/finance/invoice-status-badge";
import { InvoiceTable } from "@/components/finance/invoice-table";
import type { DataTableColumn } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import type { Invoice } from "@/lib/expert/types";
import { formatDateTime } from "@/lib/expert/utils";
import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface InvoiceRow {
  id: string;
  invoice: Invoice;
  orderCode: string;
  createdBy: string;
  customerName: string;
}

export default function FinanceInvoicesPage() {
  const { invoices, getOrderById } = useExpertStore();
  const [search, setSearch] = useState("");

  const rows = useMemo<InvoiceRow[]>(() => {
    return [...invoices]
      .sort(
        (a, b) => Number(new Date(b.issuedAt)) - Number(new Date(a.issuedAt)),
      )
      .map((invoice) => {
        const order = getOrderById(invoice.orderId);
        return {
          id: invoice.id,
          invoice,
          orderCode: order?.code ?? "-",
          createdBy: order?.createdBy ?? "-",
          customerName: order?.customerName ?? "-",
        };
      })
      .filter((row) => {
        const query = search.toLowerCase().trim();
        if (!query) return true;
        return (
          row.invoice.invoiceNumber.toLowerCase().includes(query) ||
          row.orderCode.toLowerCase().includes(query) ||
          row.createdBy.toLowerCase().includes(query) ||
          row.customerName.toLowerCase().includes(query)
        );
      });
  }, [invoices, getOrderById, search]);

  const columns: DataTableColumn<InvoiceRow>[] = [
    {
      key: "invoiceNumber",
      header: "شماره فاکتور",
      render: (row) => (
        <span className="font-semibold text-[#1F3A5F]">
          {row.invoice.invoiceNumber}
        </span>
      ),
    },
    { key: "orderCode", header: "کد سفارش", render: (row) => row.orderCode },
    { key: "creator", header: "ثبت کننده", render: (row) => row.createdBy },
    { key: "customer", header: "مشتری", render: (row) => row.customerName },
    {
      key: "issuedAt",
      header: "تاریخ صدور",
      render: (row) => formatDateTime(row.invoice.issuedAt),
    },
    {
      key: "status",
      header: "وضعیت",
      render: (row) => <InvoiceStatusBadge status={row.invoice.status} />,
    },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        <Link
          href={`/finance/invoices/${row.invoice.id}`}
          className="btn-primary rounded-xl px-3 py-1.5 text-xs font-medium text-white visited:text-white hover:text-white focus:text-white"
        >
          مشاهده فاکتور
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout role="finance" title="فاکتورها">
      <section className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 right-3.5 z-10 size-4 -translate-y-1/2 text-[#6CAE75]" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجو بر اساس شماره فاکتور، کد سفارش، مشتری یا ثبت کننده"
            className="pr-10"
          />
        </div>
      </section>

      {rows.length > 0 ? (
        <InvoiceTable columns={columns} rows={rows} rowKey={(row) => row.id} />
      ) : (
        <EmptyState
          title="فاکتوری یافت نشد"
          description="هنوز فاکتوری صادر نشده یا عبارت جستجو نتیجه ای ندارد."
        />
      )}
    </DashboardLayout>
  );
}
