"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { InvoiceTable } from "@/components/finance/invoice-table";
import type { DataTableColumn } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageErrorMessage } from "@/components/shared/page-error-message";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/api/api-error";
import { formatDateTime } from "@/lib/expert/utils";
import type { Invoice } from "@/lib/models/invoice.model";
import { listInvoices } from "@/lib/services/invoice.service";
import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface InvoiceRow {
  id: string;
  invoice: Invoice;
  orderCode: string;
  createdBy: string;
}

export default function FinanceInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadInvoices() {
      setIsLoading(true);
      setError("");

      try {
        const data = await listInvoices();
        if (isMounted) setInvoices(data);
      } catch (loadError) {
        if (isMounted) setError(getErrorMessage(loadError));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadInvoices();

    return () => {
      isMounted = false;
    };
  }, []);

  const rows = useMemo<InvoiceRow[]>(() => {
    return [...invoices]
      .sort(
        (a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)),
      )
      .map((invoice) => ({
        id: invoice.objectId || invoice.id,
        invoice,
        orderCode: invoice.orderCode || "-",
        createdBy: invoice.createdByName || "-",
      }))
      .filter((row) => {
        const query = search.toLowerCase().trim();
        if (!query) return true;
        return (
          row.invoice.invoiceCode.toLowerCase().includes(query) ||
          row.orderCode.toLowerCase().includes(query) ||
          row.createdBy.toLowerCase().includes(query)
        );
      });
  }, [invoices, search]);

  const columns: DataTableColumn<InvoiceRow>[] = [
    {
      key: "invoiceNumber",
      header: "شماره فاکتور",
      render: (row) => (
        <span className="font-semibold text-[#1F3A5F]">
          {row.invoice.invoiceCode}
        </span>
      ),
    },
    { key: "orderCode", header: "کد سفارش", render: (row) => row.orderCode },
    { key: "creator", header: "ثبت کننده", render: (row) => row.createdBy },
    {
      key: "issuedAt",
      header: "تاریخ صدور",
      render: (row) => formatDateTime(row.invoice.createdAt),
    },
    {
      key: "status",
      header: "وضعیت",
      render: (row) =>
        row.invoice.status === "needs_follow_up" ? "نیازمند پیگیری" : "صادر شده",
    },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        <Link
          href={`/finance/invoices/${row.invoice.objectId || row.invoice.id}`}
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

      {isLoading ? (
        <LoadingState title="در حال دریافت فاکتورها" />
      ) : error ? (
        <PageErrorMessage title="دریافت فاکتورها انجام نشد" message={error} />
      ) : rows.length > 0 ? (
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
