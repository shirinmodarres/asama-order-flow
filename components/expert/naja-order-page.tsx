"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { OrderSummaryCard } from "@/components/shared/order-summary-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  formatCurrency,
  formatNumber,
  getNajaAvailableStock,
} from "@/lib/expert/utils";
import type { RoleKey } from "@/lib/types";
import { ChevronLeft, PackageSearch } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface NajaOrderPageProps {
  role?: RoleKey;
}

export function NajaOrderPage({ role = "naja" }: NajaOrderPageProps) {
  const router = useRouter();
  const { products, createNajaOrder } = useExpertStore();
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [najaExpertName, setNajaExpertName] = useState("کارشناس مرادی");
  const [error, setError] = useState("");

  const selectedProduct = products.find((product) => product.id === productId);
  const totalAmount = selectedProduct
    ? selectedProduct.unitPrice * quantity
    : 0;
  const productOptions = useMemo(
    () =>
      products
        .filter((product) => product.najaInventoryQty > 0)
        .map((product) => ({
          value: product.id,
          label: `${product.name} - موجودی ناجا ${formatNumber(product.najaInventoryQty)} ${product.unit}`,
        })),
    [products],
  );

  const handleSubmit = () => {
    setError("");

    const result = createNajaOrder({
      productId,
      quantity,
      customerName,
      nationalId,
      phoneNumber,
      najaExpertName,
    });

    if (!result.ok || !result.order) {
      setError(result.error ?? "ثبت سفارش ناجا انجام نشد.");
      return;
    }

    router.push(`/naja/orders/${result.order.id}`);
  };

  return (
    <DashboardLayout role={role} title="ثبت سفارش ناجا">
      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[#334155] md:col-span-2">
              <span>کالای ناجا</span>
              <div className="relative">
                <PackageSearch className="pointer-events-none absolute top-1/2 right-3.5 z-10 size-4 -translate-y-1/2 text-[#6CAE75]" />
                <SearchableSelect
                  value={productId}
                  onValueChange={setProductId}
                  options={productOptions}
                  placeholder="انتخاب کالا از موجودی ناجا"
                  searchPlaceholder="جستجو در کالاهای ناجا"
                  emptyMessage="کالای دارای موجودی ناجا پیدا نشد"
                  triggerClassName="pr-10"
                />
              </div>
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#334155]">
              <span>تعداد</span>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#334155]">
              <span>نام ثبت کننده / کارشناس ناجا</span>
              <Input
                value={najaExpertName}
                onChange={(event) => setNajaExpertName(event.target.value)}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#334155]">
              <span>نام مشتری</span>
              <Input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#334155]">
              <span>کد ملی</span>
              <Input
                value={nationalId}
                onChange={(event) => setNationalId(event.target.value)}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#334155] md:col-span-2">
              <span>شماره موبایل</span>
              <Input
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
              />
            </label>
          </div>

          {selectedProduct ? (
            <div className="mt-5 rounded-[18px] border border-[#E7EDF3] bg-[#FBFCFD] px-4 py-3 text-sm leading-7 text-[#6B7280]">
              {`موجودی ناجا: ${formatNumber(getNajaAvailableStock(selectedProduct))} ${selectedProduct.unit} • قیمت واحد: ${formatCurrency(selectedProduct.unitPrice)} • سفارش بعد از ثبت مستقیم برای تکمیل اطلاعات انبار ارسال می شود.`}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button type="button" variant="success" onClick={handleSubmit}>
              ثبت سفارش ناجا
              <ChevronLeft className="size-4" />
            </Button>
          </div>

          {error ? (
            <p className="mt-4 rounded-[16px] border border-[#F0D0D0] bg-[#FFF6F6] px-4 py-3 text-sm text-[#9C3B3B]">
              {error}
            </p>
          ) : null}
        </Card>

        <OrderSummaryCard
          customerName={customerName || "ثبت نشده"}
          itemCount={selectedProduct ? 1 : 0}
          totalQuantity={selectedProduct ? quantity : 0}
          totalAmount={totalAmount}
          status="approved"
          warehouseStatus="awaitingNajaDetails"
        />
      </section>
    </DashboardLayout>
  );
}
