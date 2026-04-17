"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { ProductForm } from "@/components/support/product-form";
import { SectionHeader } from "@/components/shared/section-header";
import type { CreateProductInput } from "@/lib/expert/types";

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
      <SectionHeader
        title="ثبت کالای جدید"
        description="اطلاعات پایه کالا و موجودی اولیه را ثبت کنید."
      />
      {message ? (
        <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-3 text-sm text-[#1D4ED8]">
          {message}
        </div>
      ) : null}
      <ProductForm
        mode="create"
        onSubmit={onSubmit}
        onCancel={() => router.push("/support/products")}
      />
    </DashboardLayout>
  );
}
