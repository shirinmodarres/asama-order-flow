"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { EmptyState } from "@/components/shared/empty-state";

export default function SupportInventoryHistoryPage() {
  return (
    <DashboardLayout role="support" title="تاریخچه موجودی">
      {/* TODO: Connect when the backend exposes an inventory history endpoint. */}
      <EmptyState
        title="تاریخچه ای دریافت نشد"
        description="سرویس تاریخچه موجودی در backend فعلا در دسترس نیست."
      />
    </DashboardLayout>
  );
}
