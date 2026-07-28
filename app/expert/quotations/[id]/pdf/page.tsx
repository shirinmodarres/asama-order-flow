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
            if (isMounted) {
              setQuotation(result);
              if (
                new URLSearchParams(window.location.search).get("print") === "1"
              ) {
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
                // print anyway
              }
              if (isMounted) window.print();
            }, 250);
              }
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
        key: item.rowNumber || `${item.productObjectId}-${index}`,
        rowNumber: item.rowNumber || index + 1,
        sku: item.productSku || "-",
        name: item.productName || "-",
        qty: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })) ?? [],
    [quotation],
  );

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
          .pdf-letterhead {
            position: fixed !important;
            inset: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            z-index: 0 !important;
            pointer-events: none !important;
            margin: 0 !important;
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
          .print-root .customer-info {
            font-size: 10px !important;
          }
          .print-root .summary-table {
            font-size: 9.5px !important;
          }
        }
      `}</style>

      <div className="no-print mx-auto mb-4 flex max-w-[210mm] justify-end">
        <Button type="button" onClick={() => window.print()}>
          چاپ / ذخیره PDF
        </Button>
      </div>

      <section className="pdf-page relative mx-auto min-h-[297mm] w-full max-w-[210mm] overflow-visible rounded-lg border border-[#D7DEE6] bg-white shadow-sm">
        <div className="pdf-letterhead pointer-events-none absolute inset-0 z-0 opacity-100">
          <Image
            src="/A4 - 2.svg"
            alt="Asama Letterhead"
            fill
            priority
            sizes="210mm"
            className="object-contain"
          />
        </div>

        <div className="print-content print-root relative z-10 px-5 pb-5 pt-4">
          {isLoading ? (
            <p className="text-sm text-[#6B7280]">در حال دریافت پیش‌فاکتور...</p>
          ) : error ? (
            <p className="text-sm text-[#B91C1C]">{error}</p>
          ) : !quotation ? (
            <p className="text-sm text-[#6B7280]">پیش‌فاکتور یافت نشد.</p>
          ) : (
            <div className="space-y-3 text-[11px] leading-6">
              <header className="relative flex justify-between min-h-20">
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

             <div className="flex justify-center">
                <div className="bg-white/95 px-6 py-1">
                  <h1 className="text-xl font-bold text-[#102034]">
                    پیش‌فاکتور فروش
                  </h1>
                </div>
              </div>

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

              <section className="print-section overflow-hidden rounded-md border border-[#CBD5E1] bg-white/95">
                <table className="items-table detail-table w-full border-collapse text-right text-[10px]">
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
                    {itemRows.map((row) => (
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

              <section className="summary-table mr-auto w-full max-w-[260px] overflow-hidden rounded-md border border-[#CBD5E1] bg-white/95 text-[10px]">
                <Total label="جمع جزء" value={quotation.subtotal} />
                {/* <Total
                  label="درصد تخفیف"
                  value={`${formatNumber(quotation.discountPercentage)}%`}
                  raw
                /> */}
                <Total label="مبلغ تخفیف" value={quotation.discountAmount} />
                <Total
                  label="مالیات (۱۰٪)"
                  value={quotation.taxAmount}
                />
                <Total label="جمع کل" value={quotation.total} emphasis />
              </section>

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

            </div>
          )}
        </div>
      </section>
    </main>
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
    <div className={`flex gap-2 leading-5 ${className ?? ""}`}>
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
  raw = false,
}: {
  label: string;
  value: number | string;
  emphasis?: boolean;
  raw?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 border-b border-[#E5E7EB] px-3 py-2 last:border-b-0 ${
        emphasis ? "bg-[#F8FAFC] font-bold text-[#102034]" : ""
      }`}
    >
      <span>{label}</span>
      <span>{raw ? String(value) : formatCurrency(value)}</span>
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
    customer.addresses?.[0]?.Address ||
    customer.addresses?.[0]?.address ||
    customer.defaultAddress?.Address ||
    customer.defaultAddress?.address ||
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
