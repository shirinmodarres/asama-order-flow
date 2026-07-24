"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/api-error";
import { formatDate, formatCurrency, formatNumber } from "@/lib/expert/utils";
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
            window.setTimeout(() => window.print(), 250);
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
            width: 210mm;
            min-height: 297mm;
            margin: 0 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .pdf-page {
            box-shadow: none !important;
            border: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            border-radius: 0 !important;
          }
          .print-content {
            padding: 10mm 11mm 11mm !important;
          }
          .print-section,
          .print-table-row {
            break-inside: avoid;
          }
          .items-table thead {
            display: table-header-group;
          }
        }
      `}</style>

      <div className="no-print mx-auto mb-4 flex max-w-[210mm] justify-end">
        <Button type="button" onClick={() => window.print()}>
          چاپ / ذخیره PDF
        </Button>
      </div>

      <section className="pdf-page relative mx-auto min-h-[210mm] w-full max-w-[148mm] overflow-hidden rounded-lg border border-[#D7DEE6] bg-white shadow-sm">
        <div className="pointer-events-none absolute inset-0 z-0 opacity-100">
          <Image
            src="/1.jpg"
            alt="Asama Letterhead"
            fill
            priority
            sizes="148mm"
            className="object-cover"
          />
        </div>

        <div className="print-content relative z-10 px-5 pb-5 pt-4">
          {isLoading ? (
            <p className="text-sm text-[#6B7280]">در حال دریافت پیش‌فاکتور...</p>
          ) : error ? (
            <p className="text-sm text-[#B91C1C]">{error}</p>
          ) : !quotation ? (
            <p className="text-sm text-[#6B7280]">پیش‌فاکتور یافت نشد.</p>
          ) : (
            <div className="space-y-3 text-[10px] leading-5">
              <header className="relative flex justify-between min-h-20">
                <div className="absolute left-0 top-0  border-r-2 border-[#7BC68A] bg-white/95 px-3 py-1.5 text-[9px] leading-5 text-[#334155]">
                 <InlineInfo
                    label="شماره پیش‌فاکتور"
                    value={formatFaDigits(quotation.quotationNumber) || "-"}
                  />
                  <InlineInfo
                    label="تاریخ صدور"
                    value={quotation.createdAt ? formatDate(quotation.createdAt) : "-"}
                  />
                  <InlineInfo
                    label="اعتبار تا"
                    value={quotation.validUntil ? formatDate(quotation.validUntil) : "-"}
                  />
                </div>
              </header>

             <div className="flex justify-center">
                <div className="bg-white/95 px-6 py-1">
                  <h1 className="text-lg font-bold text-[#102034]">
                    پیش‌فاکتور فروش
                  </h1>
                </div>
              </div>

              <section className="print-section rounded-md border border-[#CBD5E1] bg-white/95 px-3 py-2">
                <h2 className="mb-1.5 border-b border-[#E2E8F0] pb-1 text-[11px] font-bold text-[#1F3A5F]">
                  اطلاعات مشتری
                </h2>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  <InlineInfo label="نام مشتری" value={quotation.customerName || "-"} />
                  <InlineInfo
                    label="کد مشتری"
                    value={
                      quotation.customer?.sepidarCustomerCode
                        ? formatFaDigits(quotation.customer.sepidarCustomerCode)
                          : "-"
                    }
                  />
                  <InlineInfo
                    label="کد ملی / اقتصادی"
                    value={quotation.customer?.nationalId || "-"}
                  />
                  <InlineInfo
                    label="آدرس"
                    value={resolveQuotationAddress(quotation)}
                    className="col-span-2"
                  />
                </dl>
              </section>

              <section className="print-section overflow-hidden rounded-md border border-[#CBD5E1] bg-white/95">
                <table className="items-table w-full border-collapse text-right text-[9px]">
                  <thead>
                    <tr className="bg-[#F1F5F9] text-[#334155]">
                      {["ردیف", "کد کالا", "نام کالا", "تعداد", "واحد", "فی", "مبلغ"].map(
                        (header) => (
                          <th
                            key={header}
                            className="border-b border-[#D7DEE6] px-2 py-2 font-semibold"
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

              <section className="mr-auto w-full max-w-[420px] overflow-hidden rounded-md border border-[#CBD5E1] bg-white/95 text-sm">
                <Total label="جمع جزء" value={quotation.subtotal} />
                <Total
                  label="درصد تخفیف"
                  value={`${formatNumber(quotation.discountPercentage)}%`}
                  raw
                />
                <Total label="مبلغ تخفیف" value={quotation.discountAmount} />
                <Total
                  label="مالیات (۱۰٪)"
                  value={quotation.taxAmount}
                />
                <Total label="جمع کل" value={quotation.total} emphasis />
              </section>

              <section className="print-section rounded-md border border-[#CBD5E1] bg-white/95 px-3 py-2">
                <h2 className="mb-1.5 border-b border-[#E2E8F0] pb-1 text-[11px] font-bold text-[#1F3A5F]">
                  توضیحات و شرایط
                </h2>
                <p className="whitespace-pre-wrap text-[9px] leading-5 text-[#334155]">
                  {quotation.notes || "-"}
                </p>
                <p className="mt-2 text-[9px] leading-5 text-[#334155]">
                  این پیش‌فاکتور تا تاریخ{" "}
                  {quotation.validUntil ? formatDate(quotation.validUntil) : "-"}{" "}
                  معتبر بوده و پس از آن نیازمند استعلام مجدد قیمت می‌باشد.
                </p>
              </section>

              <section className="print-section grid grid-cols-3 gap-2">
                {["تنظیم کننده", "تأیید فروش", "مهر و امضاء مشتری"].map((label) => (
                  <div
                    key={label}
                    className="flex min-h-16 items-start justify-center rounded-md border border-[#CBD5E1] bg-white/95 px-2 pt-2 text-[9px] font-semibold text-[#334155]"
                  >
                    {label}
                  </div>
                ))}
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
  return <td className="border-b border-[#E5E7EB] px-2 py-2 align-top">{children}</td>;
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
    "-"
  );
}
