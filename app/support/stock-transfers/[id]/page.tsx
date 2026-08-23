"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Ban } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { EmptyState } from "@/components/shared/empty-state";
import { InlineErrorMessage } from "@/components/shared/inline-error-message";
import { LoadingState } from "@/components/shared/loading-state";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api/api-error";
import { formatDateTime, formatNumber } from "@/lib/expert/utils";
import type { StockTransferRequest } from "@/lib/models/stock.model";
import { getStoredCurrentUser } from "@/lib/services/auth.service";
import { cancelStockTransfer, getSupportStockTransfer } from "@/lib/services/stock.service";
import { useParams } from "next/navigation";

const cancellableStatuses = new Set([
  "pending",
  "pending_manager_approval",
  "approved_waiting_warehouse_scan",
  "approved_waiting_tracking_codes",
  "approved",
]);

export default function SupportStockTransferDetailPage() {
  const params = useParams<{ id: string }>();
  const [transfer, setTransfer] = useState<StockTransferRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    void getSupportStockTransfer(params.id)
      .then((data) => mounted && setTransfer(data))
      .catch((loadError) => mounted && setError(getErrorMessage(loadError)))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [params.id]);

  const items = useMemo(() => transfer?.items ?? [], [transfer]);
  const canCancel = Boolean(transfer && cancellableStatuses.has(transfer.status));

  const handleCancel = async () => {
    if (!transfer || !canCancel) return;
    setSubmitting(true);
    setError("");
    try {
      const updated = await cancelStockTransfer(transfer.objectId, {
        cancelledByName: getStoredCurrentUser()?.fullName || getStoredCurrentUser()?.username || "پشتیبان",
      });
      setTransfer(updated);
      setMessage("درخواست انتقال لغو شد و موجودی قابل استفاده باقی ماند.");
    } catch (cancelError) {
      setError(getErrorMessage(cancelError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="support" title="جزئیات انتقال">
      <SectionHeader
        title="جزئیات درخواست انتقال"
        description="اقلام و وضعیت انتقال بین انبارها"
        actions={<Link href="/support/stock-transfers" className="btn-secondary"><ArrowRight className="size-4" />بازگشت</Link>}
      />
      {message ? <div className="asama-banner px-4 py-3 text-sm">{message}</div> : null}
      {error ? <InlineErrorMessage message={error} /> : null}
      {loading ? <LoadingState title="در حال دریافت جزئیات انتقال" /> : !transfer ? (
        <EmptyState title="درخواست انتقال یافت نشد" description="شناسه انتقال معتبر نیست." />
      ) : (
        <div className="space-y-5">
          <Card className="p-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Info label="وضعیت" value={<Badge variant={transfer.status === "cancelled" ? "destructive" : "neutral"}>{transfer.statusLabel}</Badge>} />
              <Info label="انبار مبدأ" value={transfer.sourceStockTitle || "-"} />
              <Info label="انبار مقصد" value={transfer.destinationStockTitle || "-"} />
              <Info label="تعداد کل" value={formatNumber(transfer.quantity)} />
              <Info label="درخواست‌کننده" value={transfer.requestedByName || "-"} />
              <Info label="زمان درخواست" value={transfer.requestedAt ? formatDateTime(transfer.requestedAt) : "-"} />
              <Info label="تأییدکننده" value={transfer.approvedByName || "-"} />
              <Info label="زمان تأیید" value={transfer.approvedAt ? formatDateTime(transfer.approvedAt) : "-"} />
            </div>
            {transfer.note ? <p className="mt-4 rounded-xl bg-[#F8FAFC] px-4 py-3 text-sm leading-7 text-[#334155]">{transfer.note}</p> : null}
            {canCancel ? (
              <Button type="button" variant="destructive" className="mt-4" onClick={handleCancel} disabled={submitting}>
                <Ban className="size-4" />{submitting ? "در حال لغو..." : "لغو درخواست انتقال"}
              </Button>
            ) : null}
          </Card>
          <Card className="overflow-hidden p-0">
            <div className="border-b border-[#E5E7EB] px-5 py-4"><h2 className="font-bold text-[#102034]">اقلام انتقال</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm"><thead className="bg-[#F8FAFC]"><tr><Th>ردیف</Th><Th>کالا</Th><Th>تعداد</Th></tr></thead>
                <tbody>{items.map((item, index) => <tr key={`${item.productObjectId}-${index}`} className="border-t border-[#E5E7EB]"><Td>{formatNumber(index + 1)}</Td><Td>{item.productName || "-"}</Td><Td>{formatNumber(item.quantity)}</Td></tr>)}</tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3"><div className="text-xs text-[#64748B]">{label}</div><div className="mt-1 text-sm font-semibold text-[#102034]">{value}</div></div>;
}
function Th({ children }: { children: React.ReactNode }) { return <th className="px-4 py-3 text-right font-semibold">{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="px-4 py-3">{children}</td>; }
