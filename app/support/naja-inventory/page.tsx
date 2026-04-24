"use client";

import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { InventoryUpdateModal } from "@/components/support/inventory-update-modal";
import { ProductStatusBadge } from "@/components/support/product-status-badge";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product, UpdateInventoryInput } from "@/lib/expert/types";
import { compareText, formatNumber, getNajaAvailableStock } from "@/lib/expert/utils";

export default function SupportNajaInventoryPage() {
  const { products, updateInventory } = useExpertStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalChangeType, setModalChangeType] = useState<"increase" | "decrease">("increase");
  const [message, setMessage] = useState("");

  const rows = useMemo(
    () => [...products].sort((a, b) => compareText(a.name, b.name)),
    [products],
  );

  const openModal = (product: Product, changeType: "increase" | "decrease") => {
    setSelectedProduct(product);
    setModalChangeType(changeType);
    setModalOpen(true);
  };

  const columns: DataTableColumn<Product>[] = [
    { key: "name", header: "کالا", render: (row) => row.name },
    { key: "brand", header: "برند", render: (row) => row.brand },
    {
      key: "naja",
      header: "موجودی ناجا",
      render: (row) => formatNumber(getNajaAvailableStock(row)),
    },
    {
      key: "status",
      header: "وضعیت",
      render: (row) => <ProductStatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={() => openModal(row, "increase")}>
            افزایش موجودی ناجا
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => openModal(row, "decrease")}
          >
            کاهش موجودی ناجا
          </Button>
        </div>
      ),
    },
  ];

  const submitInventory = (input: UpdateInventoryInput) => {
    const result = updateInventory(input);

    if (!result.ok) {
      setMessage(result.error ?? "تغییر موجودی ناجا ثبت نشد.");
      return;
    }

    setMessage(result.message ?? "تغییر موجودی ناجا ثبت شد.");
    setModalOpen(false);
  };

  return (
    <DashboardLayout role="support" title="موجودی ناجا">
      <SectionHeader
        title="موجودی ناجا"
        description="مدیریت موجودی اختصاصی سفارش هایی که با منبع ثبت ناجا وارد سیستم می شوند."
        actions={<Badge variant="warning">موجودی ناجا</Badge>}
      />

      {message ? <div className="asama-banner px-4 py-3 text-sm">{message}</div> : null}

      <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} />

      <InventoryUpdateModal
        open={modalOpen}
        product={selectedProduct}
        inventoryScope="naja"
        initialChangeType={modalChangeType}
        onClose={() => setModalOpen(false)}
        onSubmit={submitInventory}
      />
    </DashboardLayout>
  );
}
