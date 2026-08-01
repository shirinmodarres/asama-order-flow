"use client";

import { useEffect, useState } from "react";
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
import { PDF_PAGE_STYLES, PdfPage } from "@/components/pdf/pdf-shell";
import { formatFaDigits } from "@/lib/utils/number-format";

function hasText(value: string | null | undefined): boolean {
  return Boolean(value && value.trim());
}

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

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#E5E7EB] p-4 text-[#102034] print:bg-white print:p-0"
    >
      <style jsx global>{PDF_PAGE_STYLES}</style>

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
        <div className="space-y-4">
          <PdfPage pageBreakAfter>
            <div className="space-y-3 text-[10px] leading-5">
              <HeaderBlock data={data} />
              <TitleBlock />
              <CustomerBlock customer={resolvedCustomer} />
              {hasRecipientName ? (
                <RecipientBlock recipient={resolvedRecipient} />
              ) : hasText(data.receiver.fullName) ? (
                <DeliveryBlock data={data} />
              ) : null}
              <SummaryTable rows={summaryRows} />
              {hasText(data.deliveryCode) || hasText(data.notes) ? (
                <NotesBlock deliveryCode={data.deliveryCode} notes={data.notes} />
              ) : null}
            </div>
          </PdfPage>

          <PdfPage>
            <div className="space-y-3 text-[10px] leading-5">
              <HeaderBlock data={data} />
              <TitleBlock />
              <DetailTable rows={detailRows} />
              <footer className="grid grid-cols-2 gap-8 pt-7">
                <Signature label="امضای انباردار" />
                <Signature label="امضای تحویل‌گیرنده" />
              </footer>
            </div>
          </PdfPage>
        </div>
      )}
    </main>
  );
}

function HeaderBlock({ data }: { data: ExitSlipPdfData }) {
  return (
    <header className="relative flex min-h-24 items-start justify-between">
      <div className="absolute left-0 top-[-12px] w-fit border-r-2 border-[#7BC68A] bg-white/95 px-2 py-0.5 text-[9px] leading-5 text-[#334155]">
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
            <TableHeader className="w-10">ردیف</TableHeader>
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
            <TableHeader className="w-10">ردیف</TableHeader>
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
      className={`break-words whitespace-normal border-l border-[#E2E8F0] px-1 py-1 align-top last:border-l-0 ${className}`}
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
