"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductForm } from "@/components/support/product-form";
import type { UpdateProductInput } from "@/lib/expert/types";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function SupportEditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getProductById, updateProduct } = useExpertStore();
  const [message, setMessage] = useState("");

  const product = getProductById(params.id);

  if (!product) {
    return (
      <DashboardLayout role="support" title="ویرایش کالا">
        <EmptyState
          title="کالا یافت نشد"
          description="شناسه کالا معتبر نیست یا در لیست موجود نیست."
        />
      </DashboardLayout>
    );
  }

  const onSubmit = (input: UpdateProductInput) => {
    const result = updateProduct(input);

    if (!result.ok) {
      setMessage(result.error ?? "ویرایش کالا انجام نشد.");
      return;
    }

    setMessage(result.message ?? "اطلاعات کالا به روز شد.");
    setTimeout(() => {
      router.push("/support/products");
    }, 700);
  };

  return (
    <DashboardLayout role="support" title="ویرایش کالا">
      {message ? (
        <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-3 text-sm text-[#1D4ED8]">
          {message}
        </div>
      ) : null}
      <ProductForm
        mode="edit"
        initialValues={{
          id: product.id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          unit: product.unit,
          unitPrice: product.unitPrice,
          description: product.description,
          status: product.status,
        }}
        onSubmit={onSubmit}
        onCancel={() => router.push("/support/products")}
      />
    </DashboardLayout>
  );
}
