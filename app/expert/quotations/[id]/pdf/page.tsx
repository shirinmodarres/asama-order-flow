"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/api-error";
import { formatCurrency, formatNumber } from "@/lib/expert/utils";
import type { SalesQuotation } from "@/lib/models/sales-quotation.model";
import { getSalesQuotationPdfData } from "@/lib/services/sales-quotation.service";
import { formatFaDigits } from "@/lib/utils/number-format";

export default function SalesQuotationPdfPage() {
  const params = useParams<{ id: string }>();
  const [quotation, setQuotation] = useState<SalesQuotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadQuotation() {
      setIsLoading(true);
      setError("");
      try {
        const result = await getSalesQuotationPdfData(params.id);
        if (!isMounted) return;

        setQuotation(result);
        if (new URLSearchParams(window.location.search).get("print") === "1") {
          window.setTimeout(async () => {
            try {
              await document.fonts?.ready;
              await Promise.all(
                Array.from(document.images).map((image) =>
                  image.complete
                    ? Promise.resolve()
                    : new Promise<void>((resolve) => {
                        image.addEventListener("load", () => resolve(), {
                          once: true,
                        });
                        image.addEventListener("error", () => resolve(), {
                          once: true,
                        });
                      }),
                ),
              );
            } catch {
              // Print anyway.
            }
            if (isMounted) window.print();
          }, 250);
        }
      } catch (loadError) {
        if (isMounted) setError(getErrorMessage(loadError));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadQuotation();
    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const itemRows = useMemo(
    () =>
      quotation?.items.map((item, index) => ({
        key: String(item.rowNumber || `${item.productObjectId}-${index}`),
        rowNumber: item.rowNumber || index + 1,
        sku: item.productSku || "-",
        name: item.productName || "-",
        qty: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })) ?? [],
    [quotation],
  );

  const rowPages = useMemo(() => {
    const addressLength = quotation ? resolveQuotationAddress(quotation).length : 0;
    const notesLength = quotation?.notes?.trim().length ?? 0;
    const firstPageCapacity = Math.max(
      6,
      8 - (addressLength > 120 ? 1 : 0) - (notesLength > 180 ? 1 : 0),
    );
    const continuationCapacity = 11;
    return paginateQuotationRows(itemRows, firstPageCapacity, continuationCapacity);
  }, [itemRows, quotation]);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#E5E7EB] p-4 text-[#102034] print:bg-white print:p-0"
    >
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html,
          body {
            width: 100%;
            min-height: 297mm;
            margin: 0 !important;
            background: white !important;
            overflow: visible !important;
            box-sizing: border-box !important;
          }
          .no-print {
            display: none !important;
          }
          .pdf-page {
            box-shadow: none !important;
            border: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            border-radius: 0 !important;
            overflow: visible !important;
            box-sizing: border-box !important;
            break-after: page;
            page-break-after: always;
          }
          .pdf-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }
          .print-content {
            padding: 18mm 20mm 16mm 20mm !important;
            overflow: visible !important;
            box-sizing: border-box !important;
          }
          .print-section,
          .print-table-row {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .items-table thead {
            display: table-header-group;
          }
          .items-table {
            width: 100% !important;
            table-layout: fixed !important;
            box-sizing: border-box !important;
            margin-inline: 0 !important;
          }
          .print-root {
            font-size: 11px !important;
            line-height: 1.9 !important;
          }
          .print-root .customer-info,
          .print-root .summary-table,
          .print-root .detail-table {
            font-size: 10px !important;
          }
        }
      `}</style>

      <div className="no-print mx-auto mb-4 flex max-w-[210mm] justify-end">
        <Button type="button" onClick={() => window.print()}>
          چاپ / ذخیره PDF
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-[#6B7280]">در حال دریافت پیش‌فاکتور...</p>
      ) : error ? (
        <p className="text-sm text-[#B91C1C]">{error}</p>
      ) : !quotation ? (
        <p className="text-sm text-[#6B7280]">پیش‌فاکتور یافت نشد.</p>
      ) : (
        <div className="space-y-4">
          {rowPages.length > 0 ? (
            rowPages.map((rows, index) => (
              <PdfPage
                key={`quotation-page-${index}`}
                pageBreakAfter={index < rowPages.length - 1}
              >
                <div className="space-y-3 text-[11px] leading-6">
                  <HeaderBlock quotation={quotation} />
                  <TitleBlock />
                  {index === 0 ? (
                    <CustomerBlock quotation={quotation} />
                  ) : null}
                  <ItemsTable rows={rows} />
                  {index === rowPages.length - 1 ? (
                    <>
                      <TotalsBlock quotation={quotation} />
                      <NotesBlock quotation={quotation} />
                    </>
                  ) : null}
                </div>
              </PdfPage>
            ))
          ) : (
            <PdfPage>
              <div className="space-y-3 text-[11px] leading-6">
                <HeaderBlock quotation={quotation} />
                <TitleBlock />
                <CustomerBlock quotation={quotation} />
                <TotalsBlock quotation={quotation} />
                <NotesBlock quotation={quotation} />
              </div>
            </PdfPage>
          )}
        </div>
      )}
    </main>
  );
}

function PdfPage({
  children,
  pageBreakAfter = false,
}: {
  children: React.ReactNode;
  pageBreakAfter?: boolean;
}) {
  return (
    <section
      className={`pdf-page relative mx-auto min-h-[297mm] w-full max-w-[210mm] overflow-visible rounded-lg border border-[#D7DEE6] bg-white shadow-sm ${
        pageBreakAfter ? "page-break-after" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-0 z-0 opacity-100">
        <Image
          src="/A4 - 2.svg"
          alt="Asama Letterhead"
          fill
          priority
          sizes="210mm"
          className="object-cover"
        />
      </div>
      <div className="print-content print-root relative z-10 px-5 pb-5 pt-4">
        {children}
      </div>
    </section>
  );
}

function HeaderBlock({ quotation }: { quotation: SalesQuotation }) {
  return (
    <header className="relative flex min-h-20 justify-between">
      <div className="absolute left-0 top-0 border-r-2 border-[#7BC68A] bg-white/95 px-3 py-1.5 text-[10px] leading-6 text-[#334155]">
        <InlineInfo
          label="شماره پیش‌فاکتور"
          value={formatFaDigits(quotation.quotationNumber) || "-"}
        />
        <InlineInfo
          label="تاریخ صدور"
          value={quotation.createdAt ? formatQuotationDate(quotation.createdAt) : "-"}
        />
        <InlineInfo
          label="تاریخ اعتبار"
          value={quotation.validUntil ? formatQuotationDate(quotation.validUntil) : "-"}
        />
      </div>
    </header>
  );
}

function TitleBlock() {
  return (
    <div className="flex justify-center">
      <div className="bg-white/95 px-6 py-1">
        <h1 className="text-xl font-bold text-[#102034]">پیش‌فاکتور فروش</h1>
      </div>
    </div>
  );
}

function CustomerBlock({ quotation }: { quotation: SalesQuotation }) {
  return (
    <section className="print-section customer-info rounded-md border border-[#CBD5E1] bg-white/95 px-3 py-2">
      <h2 className="mb-1.5 border-b border-[#E2E8F0] pb-1 text-[12px] font-bold text-[#1F3A5F]">
        اطلاعات مشتری
      </h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
        <InlineInfo label="نام مشتری" value={quotation.customerName || "-"} />
        <InlineInfo
          label="آدرس"
          value={resolveQuotationAddress(quotation)}
          className="col-span-2"
        />
      </dl>
    </section>
  );
}

function ItemsTable({
  rows,
}: {
  rows: Array<{
    key: string;
    rowNumber: number;
    sku: string;
    name: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}) {
  return (
    <section className="print-section overflow-hidden rounded-md border border-[#CBD5E1] bg-white/95">
      <table className="detail-table items-table w-full border-collapse text-right text-[10px]">
        <thead>
          <tr className="bg-[#F1F5F9] text-[#334155]">
            {["ردیف", "کد کالا", "نام کالا", "تعداد", "واحد", "فی", "مبلغ"].map(
              (header) => (
                <th
                  key={header}
                  className="border-b border-l border-[#D7DEE6] px-2 py-2 font-semibold last:border-l-0"
                >
                  {header}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="print-table-row odd:bg-white even:bg-[#F8FAFC]">
              <Cell>{formatNumber(row.rowNumber)}</Cell>
              <Cell>{formatFaDigits(row.sku) || "-"}</Cell>
              <Cell>{row.name}</Cell>
              <Cell>{formatNumber(row.qty)}</Cell>
              <Cell>عدد</Cell>
              <Cell>{formatCurrency(row.unitPrice)}</Cell>
              <Cell>{formatCurrency(row.lineTotal)}</Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function TotalsBlock({ quotation }: { quotation: SalesQuotation }) {
  return (
    <section className="summary-table mr-auto w-full max-w-[260px] overflow-hidden rounded-md border border-[#CBD5E1] bg-white/95 text-[10px]">
      <Total label="جمع جزء" value={quotation.subtotal} />
      <Total label="مبلغ تخفیف" value={quotation.discountAmount} />
      <Total label="مالیات (۱۰٪)" value={quotation.taxAmount} />
      <Total label="جمع کل" value={quotation.total} emphasis />
    </section>
  );
}

function NotesBlock({ quotation }: { quotation: SalesQuotation }) {
  return (
    <section className="print-section rounded-md border border-[#CBD5E1] bg-white/95 px-3 py-2">
      <h2 className="mb-1.5 border-b border-[#E2E8F0] pb-1 text-[12px] font-bold text-[#1F3A5F]">
        توضیحات و شرایط
      </h2>
      <p className="whitespace-pre-wrap text-[10px] leading-6 text-[#334155]">
        {quotation.notes || "-"}
      </p>
      <p className="mt-2 text-[10px] leading-6 font-bold text-[#334155]">
        این پیش‌فاکتور تا تاریخ{" "}
        {quotation.validUntil ? formatQuotationDate(quotation.validUntil) : "-"}{" "}
        معتبر بوده و پس از آن نیازمند استعلام مجدد قیمت می‌باشد.
      </p>
    </section>
  );
}

function InlineInfo({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex gap-2 leading-6 ${className ?? ""}`}>
      <span className="shrink-0 text-[#64748B]">{label}:</span>
      <strong className="font-semibold text-[#102034]">{value}</strong>
    </div>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <td className="break-inside-avoid border-b border-l border-[#E5E7EB] px-2 py-2 align-top last:border-l-0">
      {children}
    </td>
  );
}

function Total({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: number | string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 border-b border-[#E5E7EB] px-3 py-2 last:border-b-0 ${
        emphasis ? "bg-[#F8FAFC] font-bold text-[#102034]" : ""
      }`}
    >
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}

function resolveQuotationAddress(quotation: SalesQuotation): string {
  const customer = quotation.customer;
  if (!customer) return "-";
  const addresses = Array.isArray(customer.sepidarAddresses)
    ? customer.sepidarAddresses
    : [];
  const selected =
    addresses.find((item) => item?.isMain) ||
    customer.sepidarAddress ||
    addresses[0];
  return (
    selected?.Address ||
    selected?.address ||
    selected?.fullAddress ||
    customer.sepidarAddress?.Address ||
    customer.sepidarAddress?.address ||
    "-"
  );
}

function formatQuotationDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function chunkRows<T>(rows: T[], size: number): T[][] {
  if (size <= 0) return [rows];
  const chunks: T[][] = [];
  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }
  return chunks;
}

function paginateQuotationRows<T>(
  rows: T[],
  firstPageSize: number,
  continuationSize: number,
): T[][] {
  if (rows.length <= firstPageSize) {
    return [rows];
  }

  const pages: T[][] = [rows.slice(0, firstPageSize)];
  let cursor = firstPageSize;
  while (cursor < rows.length) {
    pages.push(rows.slice(cursor, cursor + continuationSize));
    cursor += continuationSize;
  }
  return pages;
}
