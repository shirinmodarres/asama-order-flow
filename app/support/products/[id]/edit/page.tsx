"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { ProductForm } from "@/components/support/product-form";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import type { UpdateProductInput } from "@/lib/expert/types";

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
      <SectionHeader
        title={`ویرایش ${product.name}`}
        description="اطلاعات پایه و وضعیت کالا را به روز کنید."
      />
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
          description: product.description,
          status: product.status,
        }}
        onSubmit={onSubmit}
        onCancel={() => router.push("/support/products")}
      />
    </DashboardLayout>
  );
}
