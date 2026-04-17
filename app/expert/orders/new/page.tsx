"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { OrderSummaryCard } from "@/components/shared/order-summary-card";
import { SectionHeader } from "@/components/shared/section-header";
import { formatNumber, getAvailableStock, getOrderItemCount, getOrderTotalQuantity } from "@/lib/expert/utils";

interface DraftItem {
  rowId: string;
  productId: string;
  quantity: number;
}

export default function NewExpertOrderPage() {
  const router = useRouter();
  const { products, createOrder } = useExpertStore();
  const [items, setItems] = useState<DraftItem[]>([{ rowId: "1", productId: "", quantity: 1 }]);
  const [error, setError] = useState("");

  const normalizedItems = useMemo(
    () => items.filter((item) => item.productId && item.quantity > 0).map((item) => ({ productId: item.productId, quantity: item.quantity })),
    [items],
  );

  const totalItems = getOrderItemCount(normalizedItems);
  const totalQuantity = getOrderTotalQuantity(normalizedItems);

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

    if (normalizedItems.length === 0) {
      setError("حداقل یک آیتم معتبر به سفارش اضافه کنید.");
      return;
    }

    const result = createOrder({ items: normalizedItems });

    if (!result.ok || !result.order) {
      setError(result.error ?? "ثبت سفارش انجام نشد.");
      return;
    }

    router.push(`/expert/orders/${result.order.id}`);
  };

  return (
    <DashboardLayout role="expert" title="ثبت سفارش جدید">
      <SectionHeader
        title="ایجاد سفارش"
        description="پس از ثبت، وضعیت سفارش در انتظار تایید و وضعیت انبار رزرو موجودی خواهد بود."
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-[#1F3A5F]">آیتم های سفارش</h3>

          <div className="mt-4 space-y-3">
            {items.map((item, index) => {
              const product = products.find((entry) => entry.id === item.productId);

              return (
                <div key={item.rowId} className="grid gap-2 rounded-[12px] border border-[#E5E7EB] bg-[#FBFCFD] p-3 md:grid-cols-[1fr_140px_auto]">
                  <select
                    value={item.productId}
                    onChange={(event) => updateRow(item.rowId, { productId: event.target.value })}
                    className="rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#1F3A5F]"
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
                    className="rounded-[12px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#1F3A5F]"
                  />

                  <button
                    type="button"
                    onClick={() => removeRow(item.rowId)}
                    className="rounded-[12px] border border-[#E5E7EB] px-3 py-2 text-sm text-[#64748B] hover:border-[#CBD5E1]"
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
              className="rounded-[12px] border border-[#E5E7EB] px-4 py-2 text-sm text-[#334155] hover:border-[#CBD5E1]"
            >
              افزودن آیتم
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-[12px] border border-[#1F3A5F] bg-[#1F3A5F] px-4 py-2 text-sm text-white hover:bg-[#294B79]"
            >
              ثبت سفارش
            </button>
          </div>

          {error ? <p className="mt-3 text-sm text-[#B91C1C]">{error}</p> : null}
        </div>

        <OrderSummaryCard itemCount={totalItems} totalQuantity={totalQuantity} status="pending" warehouseStatus="reserved" />
      </section>
    </DashboardLayout>
  );
}
