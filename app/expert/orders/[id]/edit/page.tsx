"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderSummaryCard } from "@/components/shared/order-summary-card";
import { SectionHeader } from "@/components/shared/section-header";
import { getOrderEditBlockReason } from "@/lib/expert/mock-data";
import { formatNumber, getAvailableStock, getOrderItemCount, getOrderTotalQuantity, isOrderEditable } from "@/lib/expert/utils";

interface DraftItem {
  rowId: string;
  productId: string;
  quantity: number;
}

export default function EditExpertOrderPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { products, getOrderById, updateOrder } = useExpertStore();
  const order = getOrderById(params.id);

  const [items, setItems] = useState<DraftItem[]>(() =>
    order ? order.items.map((item, index) => ({ rowId: `${index}-${item.productId}`, productId: item.productId, quantity: item.quantity })) : [],
  );
  const [error, setError] = useState("");

  const normalizedItems = useMemo(
    () => items.filter((item) => item.productId && item.quantity > 0).map((item) => ({ productId: item.productId, quantity: item.quantity })),
    [items],
  );

  if (!order) {
    return (
      <DashboardLayout role="expert" title="ویرایش سفارش">
        <EmptyState title="سفارش یافت نشد" description="شناسه سفارش نامعتبر است یا این سفارش وجود ندارد." />
      </DashboardLayout>
    );
  }

  const editable = isOrderEditable(order);
  const blockReason = getOrderEditBlockReason(order.status);

  const addRow = () => {
    setItems((current) => [...current, { rowId: `${Date.now()}-${current.length}`, productId: "", quantity: 1 }]);
  };

  const removeRow = (rowId: string) => {
    setItems((current) => {
      if (current.length === 1) return current;
      return current.filter((item) => item.rowId !== rowId);
    });
  };

  const updateRow = (rowId: string, patch: Partial<DraftItem>) => {
    setItems((current) => current.map((item) => (item.rowId === rowId ? { ...item, ...patch } : item)));
  };

  const handleSubmit = () => {
    setError("");

    if (!editable) {
      setError(blockReason);
      return;
    }

    const result = updateOrder({ id: order.id, items: normalizedItems });

    if (!result.ok) {
      setError(result.error ?? "ویرایش سفارش انجام نشد.");
      return;
    }

    router.push(`/expert/orders/${order.id}`);
  };

  return (
    <DashboardLayout role="expert" title="ویرایش سفارش">
      <SectionHeader
        title={`ویرایش ${order.code}`}
        description="ویرایش فقط تا قبل از تایید، لغو یا فاکتور شدن مجاز است."
        actions={
          <Link
            href={`/expert/orders/${order.id}`}
            className="rounded-[12px] border border-[#E5E7EB] px-4 py-2 text-sm text-[#334155] hover:border-[#CBD5E1]"
          >
            بازگشت به جزئیات
          </Link>
        }
      />

      {!editable ? (
        <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]">{blockReason}</div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-[#1F3A5F]">آیتم های قابل ویرایش</h3>

          <div className="mt-4 space-y-3">
            {items.map((item, index) => {
              const product = products.find((entry) => entry.id === item.productId);

              return (
                <div key={item.rowId} className="grid gap-2 rounded-[12px] border border-[#E5E7EB] bg-[#FBFCFD] p-3 md:grid-cols-[1fr_140px_auto]">
                  <select
                    value={item.productId}
                    onChange={(event) => updateRow(item.rowId, { productId: event.target.value })}
                    disabled={!editable}
                    className="rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#1F3A5F] disabled:cursor-not-allowed disabled:bg-[#F8FAFC]"
                  >
                    <option value="">انتخاب کالا</option>
                    {products.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name} - {option.brand}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) => updateRow(item.rowId, { quantity: Number(event.target.value) })}
                    disabled={!editable}
                    className="rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#1F3A5F] disabled:cursor-not-allowed disabled:bg-[#F8FAFC]"
                  />

                  <button
                    type="button"
                    onClick={() => removeRow(item.rowId)}
                    disabled={!editable}
                    className="rounded-[12px] border border-[#E5E7EB] px-3 py-2 text-sm text-[#64748B] hover:border-[#CBD5E1] disabled:cursor-not-allowed disabled:bg-[#F8FAFC]"
                  >
                    حذف
                  </button>

                  <p className="md:col-span-3 text-xs text-[#6B7280]">
                    {product ? `موجودی قابل استفاده: ${formatNumber(getAvailableStock(product))}` : `آیتم ${formatNumber(index + 1)}`}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addRow}
              disabled={!editable}
              className="rounded-[12px] border border-[#E5E7EB] px-4 py-2 text-sm text-[#334155] hover:border-[#CBD5E1] disabled:cursor-not-allowed disabled:bg-[#F8FAFC]"
            >
              افزودن آیتم
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!editable}
              className="rounded-[12px] border border-[#1F3A5F] bg-[#1F3A5F] px-4 py-2 text-sm text-white hover:bg-[#294B79] disabled:cursor-not-allowed disabled:border-[#CBD5E1] disabled:bg-[#CBD5E1]"
            >
              ذخیره تغییرات
            </button>
          </div>

          {error ? <p className="mt-3 text-sm text-[#B91C1C]">{error}</p> : null}
        </div>

        <OrderSummaryCard
          itemCount={getOrderItemCount(normalizedItems)}
          totalQuantity={getOrderTotalQuantity(normalizedItems)}
          status={order.status}
          warehouseStatus={order.warehouseStatus}
        />
      </section>
    </DashboardLayout>
  );
}
