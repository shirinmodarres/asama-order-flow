"use client";

import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { InventoryUpdateModal } from "@/components/support/inventory-update-modal";
import { ProductStatusBadge } from "@/components/support/product-status-badge";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { SectionHeader } from "@/components/shared/section-header";
import type { Product, UpdateInventoryInput } from "@/lib/expert/types";
import { formatNumber, getAvailableStock } from "@/lib/expert/utils";

export default function SupportInventoryPage() {
  const { products, updateInventory } = useExpertStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalChangeType, setModalChangeType] = useState<"increase" | "decrease">("increase");
  const [message, setMessage] = useState("");

  const openModal = (product: Product, changeType: "increase" | "decrease") => {
    setSelectedProduct(product);
    setModalChangeType(changeType);
    setModalOpen(true);
  };

  const rows = useMemo(() => [...products].sort((a, b) => a.name.localeCompare(b.name, "fa")), [products]);

  const columns: DataTableColumn<Product>[] = [
    { key: "name", header: "کالا", render: (row) => row.name },
    { key: "total", header: "موجودی کل", render: (row) => formatNumber(row.totalStock) },
    { key: "reserved", header: "موجودی رزروشده", render: (row) => formatNumber(row.reservedStock) },
    { key: "available", header: "موجودی قابل استفاده", render: (row) => formatNumber(getAvailableStock(row)) },
    { key: "status", header: "وضعیت", render: (row) => <ProductStatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openModal(row, "increase")}
            className="rounded-[12px] border border-[#1F3A5F] bg-[#1F3A5F] px-3 py-1.5 text-xs text-white"
          >
            افزایش موجودی
          </button>
          <button
            type="button"
            onClick={() => openModal(row, "decrease")}
            className="rounded-[12px] border border-[#B91C1C] bg-[#B91C1C] px-3 py-1.5 text-xs text-white"
          >
            کاهش موجودی
          </button>
        </div>
      ),
    },
  ];

  const submitInventory = (input: UpdateInventoryInput) => {
    const result = updateInventory(input);

    if (!result.ok) {
      setMessage(result.error ?? "تغییر موجودی ثبت نشد.");
      return;
    }

    setMessage(result.message ?? "تغییر موجودی ثبت شد.");
    setModalOpen(false);
  };

  return (
    <DashboardLayout role="support" title="به روزرسانی موجودی">
      <SectionHeader title="کنترل موجودی" description="افزایش یا کاهش کنترل شده موجودی کالاها" />
      {message ? <div className="rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] p-3 text-sm text-[#1D4ED8]">{message}</div> : null}
      <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} />

      <InventoryUpdateModal
        open={modalOpen}
        product={selectedProduct}
        initialChangeType={modalChangeType}
        onClose={() => setModalOpen(false)}
        onSubmit={submitInventory}
      />
    </DashboardLayout>
  );
}
