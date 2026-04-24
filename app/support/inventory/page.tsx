"use client";

import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { InventoryUpdateModal } from "@/components/support/inventory-update-modal";
import { ProductStatusBadge } from "@/components/support/product-status-badge";
import { Button } from "@/components/ui/button";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { SectionHeader } from "@/components/shared/section-header";
import type { Product, UpdateInventoryInput } from "@/lib/expert/types";
import {
  compareText,
  formatNumber,
  getAvailableStock,
} from "@/lib/expert/utils";

export default function SupportInventoryPage() {
  const { products, updateInventory } = useExpertStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalChangeType, setModalChangeType] = useState<
    "increase" | "decrease"
  >("increase");
  const [message, setMessage] = useState("");

  const openModal = (product: Product, changeType: "increase" | "decrease") => {
    setSelectedProduct(product);
    setModalChangeType(changeType);
    setModalOpen(true);
  };

  const rows = useMemo(
    () => [...products].sort((a, b) => compareText(a.name, b.name)),
    [products],
  );

  const columns: DataTableColumn<Product>[] = [
    { key: "name", header: "کالا", render: (row) => row.name },
    {
      key: "total",
      header: "موجودی کل",
      render: (row) => formatNumber(row.totalStock),
    },
    {
      key: "reserved",
      header: "موجودی رزروشده",
      render: (row) => formatNumber(row.reservedStock),
    },
    {
      key: "available",
      header: "موجودی قابل استفاده",
      render: (row) => formatNumber(getAvailableStock(row)),
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
          <Button
            type="button"
            size="sm"
            onClick={() => openModal(row, "increase")}
          >
            افزایش موجودی
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => openModal(row, "decrease")}
          >
            کاهش موجودی
          </Button>
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
      {message ? (
        <div className="asama-banner px-4 py-3 text-sm">{message}</div>
      ) : null}
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
