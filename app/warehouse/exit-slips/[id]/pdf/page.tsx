"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/api-error";
import { formatDateTime, formatNumber } from "@/lib/expert/utils";
import type { ExitSlipPdfData } from "@/lib/models/warehouse.model";
import { getExitSlipPdfData } from "@/lib/services/warehouse.service";
import {
  resolveExitSlipPdfCustomer,
  resolveExitSlipPdfRecipient,
} from "@/lib/utils/exit-slip-customer";
import { formatFaDigits } from "@/lib/utils/number-format";

function hasText(value: string | null | undefined): boolean {
  return Boolean(value && value.trim());
}

const SUMMARY_ROWS_PER_PAGE = 12;
const DETAIL_ROWS_PER_PAGE = 16;

export default function ExitSlipPdfPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<ExitSlipPdfData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadPdfData() {
      setIsLoading(true);
      setError("");
      try {
        const result = await getExitSlipPdfData(params.id);
        if (isMounted) {
          setData(result);
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
                // Ignore font or image wait issues and still print.
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

    loadPdfData();
    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const resolvedCustomer = data ? resolveExitSlipPdfCustomer(data) : null;
  const resolvedRecipient = data ? resolveExitSlipPdfRecipient(data) : null;
  const hasRecipientName = Boolean(
    resolvedRecipient?.fullName?.trim() ||
      data?.receiver?.fullName?.trim() ||
      data?.recipient?.firstName?.trim() ||
      data?.recipient?.lastName?.trim(),
  );
  const summaryRows =
    data?.items.map((item, index) => ({
      key: item.productObjectId || item.productSku || `${item.productName}-${index}`,
      productName: item.productName,
      quantity: item.quantity,
    })) ?? [];
  const detailRows =
    data?.items.flatMap((item) => {
      if (!item.units.length) {
        return [
          {
            key: item.productObjectId || item.productSku || item.productName,
            productName: item.productName,
            productSku: item.productSku,
            productIdentifier: "",
            serialNumber: "",
            trackingCode: "",
          },
        ];
      }

      return item.units.map((unit, index) => ({
        key:
          unit.unitObjectId ||
          `${item.productObjectId || item.productSku}-${index}`,
        productName: item.productName,
        productSku: item.productSku,
        productIdentifier: unit.productIdentifier,
        serialNumber: unit.serialNumber,
        trackingCode: unit.trackingCode,
      }));
    }) ?? [];
  const summaryPages = paginateRows(summaryRows, SUMMARY_ROWS_PER_PAGE);
  const detailPages = paginateRows(detailRows, DETAIL_ROWS_PER_PAGE);
  const hasDetailPages = detailPages.length > 0;

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
            height: 297mm !important;
            margin: 0 !important;
            border-radius: 0 !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }
          .page-break-after {
            break-after: page;
            page-break-after: always;
          }
          .pdf-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }
          .print-content {
            padding: 18mm 18mm 16mm 18mm !important;
            overflow: hidden !important;
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
          .print-root .recipient-info {
            font-size: 10px !important;
          }
          .print-root .summary-table,
          .print-root .detail-table {
            font-size: 9.5px !important;
          }
          .print-root .serial-cell,
          .print-root .tracking-cell {
            font-size: 8.5px !important;
          }
          .print-root .pdf-page {
            break-after: page;
            page-break-after: always;
          }
          .print-root .pdf-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }
        }
      `}</style>

      <div className="no-print mx-auto mb-4 flex max-w-[210mm] justify-end">
        <Button type="button" onClick={() => window.print()}>
          چاپ / ذخیره PDF
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-[#6B7280]">در حال دریافت اطلاعات حواله...</p>
      ) : error ? (
        <p className="text-sm text-[#B91C1C]">{error}</p>
      ) : !data ? (
        <p className="text-sm text-[#6B7280]">اطلاعات حواله یافت نشد.</p>
      ) : (
        <div className="space-y-0">
          {summaryPages.map((rows, index) => (
            <PdfPage
              key={`summary-${index}`}
              pageBreakAfter={index < summaryPages.length - 1 || hasDetailPages}
            >
              <div className="space-y-3 text-[10px] leading-5">
                <HeaderBlock data={data} />
                <TitleBlock />
                {index === 0 ? (
                  <>
                    <CustomerBlock customer={resolvedCustomer} />
                    {hasRecipientName ? (
                      <RecipientBlock recipient={resolvedRecipient} />
                    ) : hasText(data.receiver.fullName) ? (
                      <DeliveryBlock data={data} />
                    ) : null}
                  </>
                ) : null}
                <SummaryTable rows={rows} />
                {index === summaryPages.length - 1 && !hasDetailPages ? (
                  <>
                    {hasText(data.deliveryCode) || hasText(data.notes) ? (
                      <NotesBlock deliveryCode={data.deliveryCode} notes={data.notes} />
                    ) : null}
                    <footer className="grid grid-cols-2 gap-8 pt-7">
                      <Signature label="امضای انباردار" />
                      <Signature label="امضای تحویل‌گیرنده" />
                    </footer>
                  </>
                ) : null}
              </div>
            </PdfPage>
          ))}

          {detailPages.map((rows, index) => (
            <PdfPage
              key={`detail-${index}`}
              pageBreakAfter={index < detailPages.length - 1}
            >
              <div className="space-y-3 text-[10px] leading-5">
                <HeaderBlock data={data} />
                <TitleBlock />
                <DetailTable rows={rows} />
                {index === detailPages.length - 1 ? (
                  <footer className="grid grid-cols-2 gap-8 pt-7">
                    <Signature label="امضای انباردار" />
                    <Signature label="امضای تحویل‌گیرنده" />
                  </footer>
                ) : null}
              </div>
            </PdfPage>
          ))}
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
      className={`pdf-page relative mx-auto h-[297mm] w-full max-w-[210mm] overflow-hidden rounded-lg border border-[#D7DEE6] bg-white shadow-sm ${
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
      <div className="print-content print-root relative z-10">
        {children}
      </div>
    </section>
  );
}

function HeaderBlock({ data }: { data: ExitSlipPdfData }) {
  return (
    <header className="relative flex min-h-20 justify-between">
      <div className="absolute left-0 top-0 border-r-2 border-[#7BC68A] bg-white/95 px-3 py-1.5 text-[10px] leading-6 text-[#334155]">
        <InlineInfo label="کد حواله" value={formatFaDigits(data.slipCode) || "-"} />
        <InlineInfo label="کد سفارش" value={formatFaDigits(data.orderCode) || "-"} />
        <InlineInfo
          label="تاریخ صدور"
          value={data.issueDate ? formatDateTime(data.issueDate) : "-"}
        />
      </div>
    </header>
  );
}

function TitleBlock() {
  return (
    <div className="flex justify-center">
      <div className="bg-white/95 px-6 py-1">
        <h1 className="text-lg font-bold text-[#102034]">حواله خروج کالا</h1>
      </div>
    </div>
  );
}

function CustomerBlock({
  customer,
}: {
  customer: ReturnType<typeof resolveExitSlipPdfCustomer> | null;
}) {
  return (
    <section className="print-section customer-info rounded-md border border-[#CBD5E1] bg-white/95 px-3 py-2">
      <h2 className="mb-1.5 border-b border-[#E2E8F0] pb-1 text-[10px] font-bold text-[#1F3A5F]">
        اطلاعات مرکز / مشتری سپیدار
      </h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[9px]">
        <InlineInfo label="نام مشتری/مرکز" value={customer?.name || "-"} />
        <InlineInfo
          label="کد دریافت"
          value={customer?.sepidarCustomerCode ? formatFaDigits(customer.sepidarCustomerCode) : "-"}
        />
        <InlineInfo
          label="موبایل/تلفن"
          value={customer?.phone ? formatFaDigits(customer.phone) : "-"}
        />
        <InlineInfo
          label="آدرس"
          value={customer?.address || "-"}
          className="col-span-2"
        />
      </dl>
    </section>
  );
}

function RecipientBlock({
  recipient,
}: {
  recipient: ReturnType<typeof resolveExitSlipPdfRecipient> | null;
}) {
  return (
    <section className="print-section recipient-info rounded-md border border-[#CBD5E1] bg-white/95 px-3 py-2">
      <h2 className="mb-1.5 border-b border-[#E2E8F0] pb-1 text-[10px] font-bold text-[#1F3A5F]">
        اطلاعات تحویل‌گیرنده ناجا
      </h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[9px]">
        <InlineInfo label="نام و نام خانوادگی" value={recipient?.fullName || "-"} />
        <InlineInfo
          label="کد ملی"
          value={recipient?.nationalId ? formatFaDigits(recipient.nationalId) : "-"}
        />
        <InlineInfo
          label="موبایل"
          value={recipient?.mobile ? formatFaDigits(recipient.mobile) : "-"}
        />
        <InlineInfo
          label="شماره سفارش ناجا"
          value={
            recipient?.najaOrderNumber ? formatFaDigits(recipient.najaOrderNumber) : "-"
          }
        />
      </dl>
    </section>
  );
}

function DeliveryBlock({ data }: { data: ExitSlipPdfData }) {
  return (
    <section className="print-section rounded-md border border-[#CBD5E1] bg-white/95 px-3 py-2">
      <h2 className="mb-1.5 border-b border-[#E2E8F0] pb-1 text-[10px] font-bold text-[#1F3A5F]">
        اطلاعات تحویل
      </h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[9px]">
        <InlineInfo label="گیرنده بار" value={data.receiver.fullName || "-"} />
        <InlineInfo
          label="موبایل گیرنده"
          value={data.receiver.phone ? formatFaDigits(data.receiver.phone) : "-"}
        />
        <InlineInfo
          label="آدرس تحویل"
          value={data.deliveryAddress.formatted || data.deliveryAddress.fullAddress || "-"}
          className="col-span-2"
        />
      </dl>
    </section>
  );
}

function SummaryTable({
  rows,
}: {
  rows: Array<{ key: string; productName: string; quantity: number }>;
}) {
  return (
    <section className="print-section rounded-md border border-[#94A3B8] bg-white/95">
      <h2 className="border-b border-[#94A3B8] px-3 py-1.5 text-[10px] font-bold text-[#1F3A5F]">
        خلاصه کالاها
      </h2>
      <table className="summary-table items-table w-full table-fixed border-collapse text-right text-[9px] leading-4">
        <thead>
          <tr className="bg-[#EDF3F7] text-[#1F3A5F]">
            <TableHeader className="w-6">ردیف</TableHeader>
            <TableHeader>نام کالا</TableHeader>
            <TableHeader className="w-16">تعداد</TableHeader>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.key} className="print-table-row border-t border-[#CBD5E1]">
              <TableCell>{formatNumber(index + 1)}</TableCell>
              <TableCell>{row.productName || "-"}</TableCell>
              <TableCell>{formatNumber(row.quantity)}</TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function DetailTable({
  rows,
}: {
  rows: Array<{
    key: string;
    productName: string;
    productSku: string;
    productIdentifier: string;
    serialNumber: string;
    trackingCode: string;
  }>;
}) {
  return (
    <section className="print-section rounded-md border border-[#94A3B8] bg-white/95">
      <h2 className="border-b border-[#94A3B8] px-3 py-1.5 text-[10px] font-bold text-[#1F3A5F]">
        جزئیات اقلام
      </h2>
      <table className="detail-table items-table w-full table-fixed border-collapse text-right text-[9px] leading-4">
        <thead>
          <tr className="bg-[#EDF3F7] text-[#1F3A5F]">
            <TableHeader className="w-6">ردیف</TableHeader>
            <TableHeader className="w-[28%]">نام کالا</TableHeader>
            <TableHeader className="w-[16%]">کد کالا</TableHeader>
            <TableHeader className="w-[22%]">سریال</TableHeader>
            <TableHeader className="w-[22%]">کد رهگیری</TableHeader>
            <TableHeader className="w-[12%]">شناسه</TableHeader>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.key} className="print-table-row border-t border-[#CBD5E1]">
              <TableCell>{formatNumber(index + 1)}</TableCell>
              <TableCell>{row.productName || "-"}</TableCell>
              <TableCell>{row.productSku ? formatFaDigits(row.productSku) : "-"}</TableCell>
              <TableCell className="serial-cell">
                {row.serialNumber ? formatFaDigits(row.serialNumber) : "-"}
              </TableCell>
              <TableCell className="tracking-cell">
                {row.trackingCode ? formatFaDigits(row.trackingCode) : "-"}
              </TableCell>
              <TableCell>
                {row.productIdentifier ? formatFaDigits(row.productIdentifier) : "-"}
              </TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function NotesBlock({
  deliveryCode,
  notes,
}: {
  deliveryCode: string | null;
  notes: string | null;
}) {
  return (
    <section className="print-section rounded-md border border-[#CBD5E1] bg-white/95 px-3 py-2">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[9px]">
        {hasText(deliveryCode) ? (
          <InlineInfo
            label="کد تأیید دریافت"
            value={formatFaDigits(deliveryCode || "")}
          />
        ) : null}
        {hasText(notes) ? <InlineInfo label="توضیحات" value={notes || ""} /> : null}
      </dl>
    </section>
  );
}

function InlineInfo({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 items-start gap-1 ${className}`}>
      <dt className="shrink-0 font-medium text-[#64748B]">{label}:</dt>
      <dd className="min-w-0 font-semibold text-[#102034]">{value}</dd>
    </div>
  );
}

function TableHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`border-l border-[#CBD5E1] px-1 py-1 font-bold last:border-l-0 ${className}`}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`break-words border-l border-[#E2E8F0] px-1 py-1 align-top last:border-l-0 ${className}`}
    >
      {children}
    </td>
  );
}

function Signature({ label }: { label: string }) {
  return (
    <div className="pt-6">
      <div className="border-t border-[#94A3B8] pt-1.5 text-center text-[9px] font-semibold">
        {label}
      </div>
    </div>
  );
}

function paginateRows<T>(rows: T[], size: number): T[][] {
  if (!rows.length) return [];
  if (size <= 0) return [rows];
  const chunks: T[][] = [];
  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }
  return chunks;
}
