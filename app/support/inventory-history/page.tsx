"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { InventoryHistoryTable } from "@/components/support/inventory-history-table";

export default function SupportInventoryHistoryPage() {
  const { inventoryHistory, products } = useExpertStore();

  return (
    <DashboardLayout role="support" title="تاریخچه موجودی">
      {inventoryHistory.length > 0 ? (
        <InventoryHistoryTable history={inventoryHistory} products={products} />
      ) : (
        <EmptyState
          title="تاریخچه ای ثبت نشده"
          description="هنوز هیچ تغییر موجودی در سیستم ثبت نشده است."
        />
      )}
    </DashboardLayout>
  );
}
