"use client";

import { ChevronLeft, PackageSearch } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderSummaryCard } from "@/components/shared/order-summary-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getOrderEditBlockReason } from "@/lib/expert/mock-data";
import {
  formatCurrency,
  formatNumber,
  getAvailableStock,
  getOrderItemCount,
  getOrderLineTotal,
  getOrderTotalAmount,
  getOrderTotalQuantity,
  isOrderEditable,
} from "@/lib/expert/utils";

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
  const [customerName, setCustomerName] = useState(order?.customerName ?? "");

  const [items, setItems] = useState<DraftItem[]>(() =>
    order
      ? order.items.map((item, index) => ({
          rowId: `${index}-${item.productId}`,
          productId: item.productId,
          quantity: item.quantity,
        }))
      : [],
  );
  const [error, setError] = useState("");
  const productsById = useMemo(
    () =>
      products.reduce<Record<string, (typeof products)[number]>>(
        (accumulator, product) => {
          accumulator[product.id] = product;
          return accumulator;
        },
        {},
      ),
    [products],
  );

  const normalizedItems = useMemo(
    () =>
      items
        .filter((item) => item.productId && item.quantity > 0)
        .map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
    [items],
  );
  const totalAmount = getOrderTotalAmount(normalizedItems, productsById);

  if (!order) {
    return (
      <DashboardLayout role="expert" title="ویرایش سفارش">
        <EmptyState
          title="سفارش یافت نشد"
          description="شناسه سفارش نامعتبر است یا این سفارش وجود ندارد."
        />
      </DashboardLayout>
    );
  }

  const editable = isOrderEditable(order);
  const blockReason = getOrderEditBlockReason(order.status);

  const addRow = () => {
    setItems((current) => [
      ...current,
      { rowId: `${Date.now()}-${current.length}`, productId: "", quantity: 1 },
    ]);
  };

  const removeRow = (rowId: string) => {
    setItems((current) => {
      if (current.length === 1) return current;
      return current.filter((item) => item.rowId !== rowId);
    });
  };

  const updateRow = (rowId: string, patch: Partial<DraftItem>) => {
    setItems((current) =>
      current.map((item) =>
        item.rowId === rowId ? { ...item, ...patch } : item,
      ),
    );
  };

  const handleSubmit = () => {
    setError("");

    if (!editable) {
      setError(blockReason);
      return;
    }

    const result = updateOrder({
      id: order.id,
      customerName,
      items: normalizedItems,
    });

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
            className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm text-[#334155] hover:border-[#CBD5E1]"
          >
            بازگشت به جزئیات
          </Link>
        }
      />

      {!editable ? (
        <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]">
          {blockReason}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <label className="grid gap-2 text-sm font-medium text-[#334155]">
            <span>نام مشتری</span>
            <Input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              disabled={!editable}
              placeholder="نام مشتری یا نمایندگی"
            />
          </label>

          <h3 className="text-base font-semibold text-[#1F3A5F]">
            آیتم های قابل ویرایش
          </h3>

          <div className="mt-4 space-y-3">
            {items.map((item, index) => {
              const product = products.find(
                (entry) => entry.id === item.productId,
              );

              return (
                <div
                  key={item.rowId}
                  className="grid gap-2 rounded-xl border border-[#E5E7EB] bg-[#FBFCFD] p-3 md:grid-cols-[1fr_140px_auto]"
                >
                  <div className="relative">
                    <PackageSearch className="pointer-events-none absolute top-1/2 right-3.5 z-10 size-4 -translate-y-1/2 text-[#6CAE75]" />
                    <SearchableSelect
                      value={item.productId || undefined}
                      onValueChange={(value) =>
                        updateRow(item.rowId, { productId: value })
                      }
                      disabled={!editable}
                      options={products.map((option) => ({
                        value: option.id,
                        label: `${option.name} - ${option.brand}`,
                      }))}
                      placeholder="انتخاب کالا"
                      searchPlaceholder="جستجو در کالاها"
                      emptyMessage="کالایی پیدا نشد"
                      triggerClassName="pr-10"
                    />
                  </div>

                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) =>
                      updateRow(item.rowId, {
                        quantity: Number(event.target.value),
                      })
                    }
                    disabled={!editable}
                  />

                  <Button
                    type="button"
                    onClick={() => removeRow(item.rowId)}
                    disabled={!editable}
                    variant="outline"
                  >
                    حذف
                  </Button>

                  <p className="md:col-span-3 text-xs text-[#6B7280]">
                    {product
                      ? `موجودی قابل استفاده: ${formatNumber(getAvailableStock(product))} ${product.unit} • قیمت واحد: ${formatCurrency(product.unitPrice)} • مبلغ ردیف: ${formatCurrency(getOrderLineTotal(item.quantity, product.unitPrice))}`
                      : `آیتم ${formatNumber(index + 1)}`}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-[18px] border border-[#E7EDF3] bg-[#FBFCFD] px-4 py-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#6B7280]">مبلغ تقریبی سفارش</span>
              <span className="font-semibold text-[#102034]">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={addRow}
              disabled={!editable}
              variant="outline"
            >
              افزودن آیتم
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!editable}
            >
              ذخیره تغییرات
              <ChevronLeft className="size-4" />
            </Button>
          </div>

          {error ? (
            <p className="mt-3 text-sm text-[#B91C1C]">{error}</p>
          ) : null}
        </div>

        <OrderSummaryCard
          customerName={customerName}
          itemCount={getOrderItemCount(normalizedItems)}
          totalQuantity={getOrderTotalQuantity(normalizedItems)}
          totalAmount={totalAmount}
          status={order.status}
          warehouseStatus={order.warehouseStatus}
        />
      </section>
    </DashboardLayout>
  );
}
