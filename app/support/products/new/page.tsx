"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  ProductForm,
  type CreateProductFormInput,
} from "@/components/support/product-form";
import { createProduct } from "@/lib/products";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SupportCreateProductPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (input: CreateProductFormInput) => {
    setIsSubmitting(true);
    setMessage("");

    try {
      await createProduct({
        id: input.id.trim(),
        name: input.name.trim(),
        brand: input.brand.trim(),
        category: input.category.trim(),
        unit: input.unit.trim(),
        unitPrice: Number(input.unitPrice),
        description: input.description?.trim() || undefined,
        status: input.status,
        totalStock: Number(input.totalStock) || 0,
      });

      setMessage("کالا با موفقیت ثبت شد.");
      setTimeout(() => {
        router.push("/support/products");
        router.refresh();
      }, 700);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "ثبت کالا انجام نشد.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="support" title="تعریف کالای جدید">
      {message ? (
        <div className="asama-banner px-4 py-3 text-sm">{message}</div>
      ) : null}
      <ProductForm
        mode="create"
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        onCancel={() => router.push("/support/products")}
      />
    </DashboardLayout>
  );
}
