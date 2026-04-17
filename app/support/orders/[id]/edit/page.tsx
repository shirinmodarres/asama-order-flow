"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderSummaryCard } from "@/components/shared/order-summary-card";
import { SectionHeader } from "@/components/shared/section-header";
import { SupportWarningBanner } from "@/components/support/support-warning-banner";
import { formatNumber, getAvailableStock, getOrderItemCount, getOrderTotalQuantity } from "@/lib/expert/utils";

interface DraftItem {
  rowId: string;
  productId: string;
  quantity: number;
}

export default function SupportOrderEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { products, getOrderById, supportEditOrder } = useExpertStore();
  const order = getOrderById(params.id);
  const [message, setMessage] = useState("");

  const [items, setItems] = useState<DraftItem[]>(() =>
    order ? order.items.map((item, index) => ({ rowId: `${index}-${item.productId}`, productId: item.productId, quantity: item.quantity })) : [],
  );

  const normalizedItems = useMemo(
    () => items.filter((item) => item.productId && item.quantity > 0).map((item) => ({ productId: item.productId, quantity: item.quantity })),
    [items],
  );

  if (!order) {
    return (
      <DashboardLayout role="support" title="ویرایش ویژه سفارش">
        <EmptyState title="سفارش یافت نشد" description="شناسه سفارش معتبر نیست یا وجود ندارد." />
      </DashboardLayout>
    );
  }

  const updateRow = (rowId: string, patch: Partial<DraftItem>) => {
    setItems((current) => current.map((item) => (item.rowId === rowId ? { ...item, ...patch } : item)));
  };

  const addRow = () => {
    setItems((current) => [...current, { rowId: `${Date.now()}-${current.length}`, productId: "", quantity: 1 }]);
  };

  const removeRow = (rowId: string) => {
    setItems((current) => {
      if (current.length === 1) return current;
      return current.filter((item) => item.rowId !== rowId);
    });
  };

  const saveChanges = () => {
    const result = supportEditOrder({ id: order.id, items: normalizedItems });

    if (!result.ok) {
      setMessage(result.error ?? "ویرایش ویژه انجام نشد.");
      return;
    }

    setMessage(result.message ?? "ویرایش ویژه ثبت شد.");
    setTimeout(() => {
      router.push("/support/orders");
    }, 700);
  };

  return (
    <DashboardLayout role="support" title="ویرایش ویژه سفارش">
      <SectionHeader
        title={`ویرایش ویژه ${order.code}`}
        description="اصلاح اضطراری اقلام سفارش توسط واحد پشتیبانی"
        actions={
          <Link
            href="/support/orders"
            className="rounded-[12px] border border-[#E5E7EB] px-4 py-2 text-sm text-[#334155] hover:border-[#CBD5E1]"
          >
            بازگشت
          </Link>
        }
      />

      <SupportWarningBanner />
      {message ? <div className="rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] p-3 text-sm text-[#1D4ED8]">{message}</div> : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-[#1F3A5F]">اقلام سفارش</h3>

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
                    className="rounded-[12px] border border-[#E5E7EB] px-3 py-2 text-sm text-[#64748B]"
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

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={addRow}
              className="rounded-[12px] border border-[#E5E7EB] px-4 py-2 text-sm text-[#334155]"
            >
              افزودن آیتم
            </button>
            <button
              type="button"
              onClick={saveChanges}
              className="rounded-[12px] border border-[#1F3A5F] bg-[#1F3A5F] px-4 py-2 text-sm text-white"
            >
              ذخیره تغییرات
            </button>
          </div>
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
