"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/api-error";
import { formatDateTime, formatNumber } from "@/lib/expert/utils";
import type { StockTransferRequest } from "@/lib/models/stock.model";
import { getWarehouseStockTransfer } from "@/lib/services/stock.service";
import { PDF_PAGE_STYLES, PdfPage } from "@/components/pdf/pdf-shell";
import { formatFaDigits } from "@/lib/utils/number-format";

export default function StockTransferPdfPage() {
  const params = useParams<{ id: string }>();
  const [transfer, setTransfer] = useState<StockTransferRequest | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    void getWarehouseStockTransfer(params.id)
      .then((result) => {
        if (!mounted) return;
        setTransfer(result);
        document.title = `حواله انتقال - ${result.sourceStockTitle || "انبار"}`;
        if (new URLSearchParams(window.location.search).get("print") === "1") {
          window.setTimeout(() => window.print(), 250);
        }
      })
      .catch((loadError) => {
        if (mounted) setError(getErrorMessage(loadError));
      });
    return () => {
      mounted = false;
    };
  }, [params.id]);

  return (
    <main dir="rtl" className="min-h-screen bg-[#E5E7EB] p-4 text-[#102034] print:bg-white print:p-0">
      <style jsx global>{PDF_PAGE_STYLES}</style>
      <div className="no-print mx-auto mb-4 flex max-w-[210mm] justify-end">
        <Button type="button" onClick={() => window.print()}>چاپ / ذخیره PDF</Button>
      </div>
      <PdfPage>
        {error ? <p className="text-sm text-red-600">{error}</p> : transfer ? <TransferDocument transfer={transfer} /> : <p>در حال دریافت حواله انتقال...</p>}
      </PdfPage>
    </main>
  );
}

function TransferDocument({ transfer }: { transfer: StockTransferRequest }) {
  const items = transfer.items.length
    ? transfer.items
    : [{
        productObjectId: transfer.productObjectId || "",
        sepidarItemId: transfer.sepidarItemId,
        productCode: transfer.productCode,
        productName: transfer.productName,
        productNameSnapshot: transfer.productName,
        quantity: transfer.quantity,
        scannedUnitIds: transfer.scannedUnitObjectIds,
        scannedUnitObjectIds: transfer.scannedUnitObjectIds,
      }];
  return (
    <div className="space-y-4 text-[11px] leading-6">
      <header className="relative flex min-h-24 items-start justify-between">
        <div className="absolute left-0 top-[-12px] border-r-2 border-[#7BC68A] bg-white/95 px-2 text-[10px] leading-6 text-[#334155]">
          <div>کد انتقال: <b>{formatFaDigits(transfer.objectId)}</b></div>
          <div>تاریخ: <b>{transfer.createdAt ? formatDateTime(transfer.createdAt) : "-"}</b></div>
          <div>وضعیت: <b>{transfer.statusLabel}</b></div>
        </div>
      </header>
      <div className="flex justify-center"><h1 className="bg-white/95 px-6 py-1 text-xl font-bold">حواله انتقال کالا</h1></div>
      <section className="rounded-md border border-[#CBD5E1] bg-white/95 px-3 py-2">
        <h2 className="border-b border-[#E2E8F0] pb-1 font-bold text-[#1F3A5F]">اطلاعات انتقال</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 pt-1">
          <Info label="انبار مبدأ" value={transfer.sourceStockTitle || "-"} />
          <Info label="انبار مقصد" value={transfer.destinationStockTitle || "-"} />
          <Info label="درخواست‌کننده" value={transfer.requestedByName || "-"} />
          <Info label="تأییدکننده" value={transfer.approvedByName || "-"} />
        </div>
      </section>
      <section className="rounded-md border border-[#94A3B8] bg-white/95">
        <h2 className="border-b border-[#94A3B8] px-3 py-1.5 font-bold text-[#1F3A5F]">جزئیات اقلام</h2>
        <table className="items-table w-full table-fixed border-collapse text-right text-[10px] leading-5">
          <thead className="bg-[#EDF3F7]"><tr><th className="w-12 border p-1">ردیف</th><th className="border p-1">نام کالا</th><th className="w-32 border p-1">کد کالا</th><th className="w-24 border p-1">تعداد</th></tr></thead>
          <tbody>{items.map((item, index) => <tr key={item.productObjectId || index} className="print-table-row"><td className="border p-1">{formatNumber(index + 1)}</td><td className="border p-1">{item.productName || item.productNameSnapshot || "-"}</td><td className="border p-1">{item.productCode ? formatFaDigits(item.productCode) : "-"}</td><td className="border p-1">{formatNumber(item.quantity)}</td></tr>)}</tbody>
        </table>
      </section>
      <div className="flex items-center justify-between rounded-md border border-[#CBD5E1] bg-white/95 px-3 py-2 font-semibold"><span>تعداد کل اقلام</span><span>{formatNumber(transfer.quantity)}</span></div>
      <footer className="grid grid-cols-2 gap-8 pt-10"><Signature label="امضای انباردار" /><Signature label="امضای تحویل‌گیرنده" /></footer>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <div><span className="text-[#64748B]">{label}: </span><b>{value}</b></div>; }
function Signature({ label }: { label: string }) { return <div className="border-t border-[#94A3B8] pt-2 text-center">{label}</div>; }
