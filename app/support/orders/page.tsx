"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useExpertStore } from "@/components/expert/expert-store-provider";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import type { ExpertOrder } from "@/lib/expert/types";

export default function SupportOrdersPage() {
  const { orders } = useExpertStore();
  const [search, setSearch] = useState("");

  const filteredOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) => Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt)),
      )
      .filter(
        (order) =>
          order.code.toLowerCase().includes(search.toLowerCase()) ||
          order.createdBy.toLowerCase().includes(search.toLowerCase()),
      );
  }, [orders, search]);

  const columns: DataTableColumn<ExpertOrder>[] = [
    {
      key: "code",
      header: "کد سفارش",
      render: (row) => (
        <span className="font-semibold text-[#1F3A5F]">{row.code}</span>
      ),
    },
    { key: "creator", header: "ثبت کننده", render: (row) => row.createdBy },
    {
      key: "status",
      header: "وضعیت سفارش",
      render: (row) => <StatusBadge type="order" status={row.status} />,
    },
    {
      key: "warehouse",
      header: "وضعیت انبار",
      render: (row) => (
        <StatusBadge type="warehouse" status={row.warehouseStatus} />
      ),
    },
    {
      key: "actions",
      header: "عملیات",
      render: (row) => (
        <Link
          href={`/support/orders/${row.id}/edit`}
          className="rounded-xl border border-[#F59E0B] bg-[#FFFBEB] px-3 py-1.5 text-xs text-[#92400E]"
        >
          ویرایش ویژه
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout role="support" title="ویرایش سفارش">
      <SectionHeader
        title="ویرایش ویژه سفارش ها"
        description="ابزار اضطراری پشتیبانی برای اصلاح سفارش خارج از مسیر معمول"
      />

      <section className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="جستجو بر اساس کد سفارش یا ثبت کننده"
          className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#1F3A5F]"
        />
      </section>

      {filteredOrders.length > 0 ? (
        <DataTable
          columns={columns}
          rows={filteredOrders}
          rowKey={(row) => row.id}
        />
      ) : (
        <EmptyState
          title="سفارشی یافت نشد"
          description="عبارت جستجو را تغییر دهید."
        />
      )}
    </DashboardLayout>
  );
}
