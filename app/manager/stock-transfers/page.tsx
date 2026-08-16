"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { InlineErrorMessage } from "@/components/shared/inline-error-message";
import { LoadingState } from "@/components/shared/loading-state";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { ApiError, getErrorMessage } from "@/lib/api/api-error";
import { formatDateTime, formatNumber } from "@/lib/expert/utils";
import type { StockTransferRequest } from "@/lib/models/stock.model";
import { getStoredCurrentUser } from "@/lib/services/auth.service";
import {
  approveStockTransfer,
  listManagerStockTransfers,
  rejectStockTransfer,
} from "@/lib/services/stock.service";

type TransferApprovalErrorDetails = {
  transferId?: string | null;
  productObjectId?: string | null;
  sourceStockObjectId?: string | null;
  destinationStockObjectId?: string | null;
  quantity?: number | string | null;
  candidateUnitsCount?: number | string | null;
  sourceInventory?: {
    objectId?: string | null;
    realQuantity?: number | string | null;
    salesQuantity?: number | string | null;
    reservedQuantity?: number | string | null;
  } | null;
  destinationInventory?: {
    objectId?: string | null;
    realQuantity?: number | string | null;
    salesQuantity?: number | string | null;
    reservedQuantity?: number | string | null;
  } | null;
};

function isTransferApprovalErrorDetails(
  value: unknown,
): value is TransferApprovalErrorDetails {
  return Boolean(value && typeof value === "object");
}

function formatTransferActionError(error: unknown): string {
  const baseMessage = getErrorMessage(error);
  if (!(error instanceof ApiError) || !isTransferApprovalErrorDetails(error.details)) {
    return baseMessage;
  }

  const details = error.details;
  const detailRows = [
    ["شناسه انتقال", details.transferId],
    ["کالا", details.productObjectId],
    ["انبار مبدأ", details.sourceStockObjectId],
    ["انبار مقصد", details.destinationStockObjectId],
    ["تعداد انتقال", details.quantity],
    ["واحدهای قابل انتقال", details.candidateUnitsCount],
    ["موجودی واقعی مبدأ", details.sourceInventory?.realQuantity],
    ["موجودی فروش مبدأ", details.sourceInventory?.salesQuantity],
    ["رزروشده مبدأ", details.sourceInventory?.reservedQuantity],
    ["موجودی واقعی مقصد", details.destinationInventory?.realQuantity],
    ["موجودی فروش مقصد", details.destinationInventory?.salesQuantity],
  ]
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([label, value]) => `${label}: ${typeof value === "number" ? formatNumber(value) : value}`);

  return detailRows.length
    ? `${baseMessage}\n${detailRows.join("\n")}`
    : baseMessage;
}

export default function ManagerStockTransfersPage() {
  const [transfers, setTransfers] = useState<StockTransferRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"pending" | "approved" | "rejected" | "all">(
    "pending",
  );

  const loadTransfers = async () => {
    const data = await listManagerStockTransfers();
    setTransfers(data);
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      setError("");
      try {
        await loadTransfers();
      } catch (loadError) {
        if (isMounted) setError(getErrorMessage(loadError));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const actorName =
    getStoredCurrentUser()?.fullName ||
    getStoredCurrentUser()?.username ||
    "مدیر فروش";

  const runAction = async (
    transfer: StockTransferRequest,
    action: "approve" | "reject",
  ) => {
    setSubmittingId(transfer.objectId);
    setError("");
    setMessage("");
    try {
      if (action === "approve") {
        await approveStockTransfer(transfer.objectId, {
          approvedByName: actorName,
        });
        setMessage("درخواست انتقال موجودی تأیید شد و برای اسکن انبار ارسال شد.");
      } else {
        await rejectStockTransfer(transfer.objectId, {
          rejectedByName: actorName,
        });
        setMessage("درخواست انتقال موجودی رد شد.");
      }
      await loadTransfers();
    } catch (actionError) {
      setError(formatTransferActionError(actionError));
    } finally {
      setSubmittingId("");
    }
  };

  const columns: DataTableColumn<StockTransferRequest>[] = [
    {
      key: "product",
      header: "کالا",
      render: (row) =>
        row.items.length > 1
          ? `${formatNumber(row.items.length)} کالا`
          : row.items[0]?.productName || row.productName || "-",
    },
    {
      key: "source",
      header: "انبار مبدأ",
      render: (row) => row.sourceStockTitle || "انبار زاگرس",
    },
    {
      key: "destination",
      header: "انبار مقصد",
      render: (row) => row.destinationStockTitle || "-",
    },
    {
      key: "quantity",
      header: "تعداد کالا",
      render: (row) => formatNumber(row.quantity),
    },
    {
      key: "requestedAt",
      header: "تاریخ",
      render: (row) => (row.requestedAt ? formatDateTime(row.requestedAt) : "-"),
    },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" asChild>
            <Link href={`/manager/stock-transfers/${row.objectId}`}>
              جزئیات
            </Link>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => runAction(row, "approve")}
            disabled={Boolean(submittingId)}
          >
            <CheckCircle2 className="size-4" />
            تأیید
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => runAction(row, "reject")}
            disabled={Boolean(submittingId)}
          >
            <XCircle className="size-4" />
            رد
          </Button>
        </div>
      ),
    },
  ];

  const filteredTransfers = transfers.filter((transfer) => {
    if (tab === "all") return true;
    if (tab === "pending") {
      return ["pending", "pending_manager_approval"].includes(transfer.status);
    }
    if (tab === "approved") {
      return [
        "approved",
        "approved_waiting_tracking_codes",
        "approved_waiting_warehouse_scan",
        "completed",
      ].includes(transfer.status);
    }
    return transfer.status === "rejected";
  });

  return (
    <DashboardLayout role="manager" title="انتقال موجودی">
      <SectionHeader
        title="تأیید انتقال موجودی"
        description="درخواست‌های انتقال از انبار زاگرس به انبارهای فروش را بررسی کنید."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { key: "pending", label: "در انتظار تأیید" },
          { key: "approved", label: "تأیید شده" },
          { key: "rejected", label: "رد شده" },
          { key: "all", label: "همه تاریخچه" },
        ].map((item) => (
          <Button
            key={item.key}
            type="button"
            variant={tab === item.key ? "default" : "outline"}
            onClick={() => setTab(item.key as typeof tab)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      {message ? <div className="asama-banner px-4 py-3 text-sm">{message}</div> : null}
      {error ? <InlineErrorMessage message={error} /> : null}
      {isLoading ? (
        <LoadingState title="در حال دریافت درخواست‌های انتقال" />
      ) : filteredTransfers.length ? (
        <DataTable columns={columns} rows={filteredTransfers} rowKey={(row) => row.objectId} />
      ) : (
        <EmptyState
          title="موردی برای نمایش نیست"
          description="تب انتخاب‌شده در حال حاضر داده‌ای ندارد."
        />
      )}
    </DashboardLayout>
  );
}
