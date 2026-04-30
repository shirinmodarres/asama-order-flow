"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { InlineErrorMessage } from "@/components/shared/inline-error-message";
import { LoadingState } from "@/components/shared/loading-state";
import { OrderSummaryCard } from "@/components/shared/order-summary-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  formatCurrency,
  formatNumber,
} from "@/lib/expert/utils";
import { getErrorMessage } from "@/lib/api/api-error";
import type { Product } from "@/lib/models/product.model";
import { createNajaOrder } from "@/lib/services/naja.service";
import { listOrders } from "@/lib/services/order.service";
import { listProducts } from "@/lib/services/product.service";
import type { RoleKey } from "@/lib/types";
import { ChevronLeft, PackageSearch } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface NajaOrderPageProps {
  role?: RoleKey;
}

export function NajaOrderPage({ role = "naja" }: NajaOrderPageProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [najaExpertName, setNajaExpertName] = useState("کارشناس مرادی");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setIsLoadingProducts(true);
      setError("");

      try {
        const data = await listProducts();
        if (isMounted) setProducts(data);
      } catch (loadError) {
        if (isMounted) setError(getErrorMessage(loadError));
      } finally {
        if (isMounted) setIsLoadingProducts(false);
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedProduct = products.find((product) => product.objectId === productId);
  const totalAmount = selectedProduct
    ? selectedProduct.unitPrice * quantity
    : 0;
  const productOptions = useMemo(
    () =>
      products
        .filter((product) => product.najaInventoryQty > 0)
        .map((product) => ({
          value: product.objectId,
          label: `${product.name} - موجودی ناجا ${formatNumber(product.najaInventoryQty)} ${product.unit}`,
        })),
    [products],
  );

  const handleSubmit = async () => {
    setError("");

    if (!productId) {
      setError("کالای ناجا را انتخاب کنید.");
      return;
    }

    if (!selectedProduct) {
      setError("کالای ناجا معتبر نیست.");
      return;
    }

    const requestedQuantity = Number(quantity);
    if (!Number.isFinite(requestedQuantity) || requestedQuantity <= 0) {
      setError("تعداد سفارش باید بیشتر از صفر باشد.");
      return;
    }

    if (requestedQuantity > selectedProduct.najaInventoryQty) {
      setError("موجودی ناجا برای این سفارش کافی نیست.");
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await createNajaOrder({
        createdByName: najaExpertName.trim(),
        customerName: customerName.trim(),
        customerNationalId: nationalId.trim(),
        customerPhone: phoneNumber.trim(),
        productObjectId: productId,
        quantity: requestedQuantity,
      });
      const [refreshedProducts] = await Promise.all([
        listProducts(),
        listOrders({ orderType: "naja" }),
      ]);
      setProducts(refreshedProducts);
      router.refresh();
      router.push(`/naja/orders/${order.objectId}`);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout role={role} title="ثبت سفارش ناجا">
      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-5">
          {isLoadingProducts ? (
            <LoadingState
              title="در حال دریافت کالاهای ناجا"
              description="فهرست کالاها از سرور دریافت می شود."
            />
          ) : null}

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
              {`موجودی ناجا: ${formatNumber(selectedProduct.najaInventoryQty)} ${selectedProduct.unit} • قیمت واحد: ${formatCurrency(selectedProduct.unitPrice)} • سفارش بعد از ثبت مستقیم برای تکمیل اطلاعات انبار ارسال می شود.`}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button type="button" variant="success" onClick={handleSubmit} disabled={isSubmitting}>
              ثبت سفارش ناجا
              <ChevronLeft className="size-4" />
            </Button>
          </div>

          {error ? (
            <div className="mt-4">
              <InlineErrorMessage message={error} />
            </div>
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
