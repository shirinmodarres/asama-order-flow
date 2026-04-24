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
import { SupportWarningBanner } from "@/components/support/support-warning-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  formatCurrency,
  formatNumber,
  getAvailableStock,
  getOrderItemCount,
  getOrderLineTotal,
  getOrderTotalAmount,
  getOrderTotalQuantity,
} from "@/lib/expert/utils";

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
  const [customerName, setCustomerName] = useState(order?.customerName ?? "");
  const [message, setMessage] = useState("");

  const [items, setItems] = useState<DraftItem[]>(() =>
    order
      ? order.items.map((item, index) => ({
          rowId: `${index}-${item.productId}`,
          productId: item.productId,
          quantity: item.quantity,
        }))
      : [],
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
  const totalAmount = getOrderTotalAmount(normalizedItems, productsById);

  if (!order) {
    return (
      <DashboardLayout role="support" title="ویرایش ویژه سفارش">
        <EmptyState
          title="سفارش یافت نشد"
          description="شناسه سفارش معتبر نیست یا وجود ندارد."
        />
      </DashboardLayout>
    );
  }

  const updateRow = (rowId: string, patch: Partial<DraftItem>) => {
    setItems((current) =>
      current.map((item) =>
        item.rowId === rowId ? { ...item, ...patch } : item,
      ),
    );
  };

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

  const saveChanges = () => {
    const result = supportEditOrder({
      id: order.id,
      customerName,
      items: normalizedItems,
    });

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
            className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm text-[#334155] hover:border-[#CBD5E1]"
          >
            بازگشت
          </Link>
        }
      />

      <SupportWarningBanner />
      {message ? (
        <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-3 text-sm text-[#1D4ED8]">
          {message}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <label className="grid gap-2 text-sm font-medium text-[#334155]">
            <span>نام مشتری</span>
            <Input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="نام مشتری یا نمایندگی"
            />
          </label>

          <h3 className="text-base font-semibold text-[#1F3A5F]">
            اقلام سفارش
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
                  />

                  <Button
                    type="button"
                    onClick={() => removeRow(item.rowId)}
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

          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              onClick={addRow}
              variant="outline"
            >
              افزودن آیتم
            </Button>
            <Button
              type="button"
              onClick={saveChanges}
            >
              ذخیره تغییرات
              <ChevronLeft className="size-4" />
            </Button>
          </div>
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
