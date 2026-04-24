"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { ProductForm } from "@/components/support/product-form";
import type { CreateProductInput } from "@/lib/expert/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SupportCreateProductPage() {
  const router = useRouter();
  const { createProduct } = useExpertStore();
  const [message, setMessage] = useState("");

  const onSubmit = (input: CreateProductInput) => {
    const result = createProduct(input);

    if (!result.ok) {
      setMessage(result.error ?? "ثبت کالا انجام نشد.");
      return;
    }

    setMessage(result.message ?? "کالا ثبت شد.");
    setTimeout(() => {
      router.push("/support/products");
    }, 700);
  };

  return (
    <DashboardLayout role="support" title="تعریف کالای جدید">
      {message ? (
        <div className="asama-banner px-4 py-3 text-sm">{message}</div>
      ) : null}
      <ProductForm
        mode="create"
        onSubmit={onSubmit}
        onCancel={() => router.push("/support/products")}
      />
    </DashboardLayout>
  );
}
