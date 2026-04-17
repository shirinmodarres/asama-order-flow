import type { InventoryHistoryEntry, Product } from "@/lib/expert/types";
import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";
import { formatDateTime, formatNumber } from "@/lib/expert/utils";

interface HistoryRow {
  id: string;
  productName: string;
  changeType: "increase" | "decrease";
  amount: number;
  createdAt: string;
  note: string;
  createdBy: string;
}

interface InventoryHistoryTableProps {
  history: InventoryHistoryEntry[];
  products: Product[];
}

export function InventoryHistoryTable({ history, products }: InventoryHistoryTableProps) {
  const rows: HistoryRow[] = history.map((entry) => ({
    id: entry.id,
    productName: products.find((product) => product.id === entry.productId)?.name ?? "کالای نامشخص",
    changeType: entry.changeType,
    amount: entry.amount,
    createdAt: entry.createdAt,
    note: entry.note,
    createdBy: entry.createdBy,
  }));

  const columns: DataTableColumn<HistoryRow>[] = [
    { key: "product", header: "کالا", render: (row) => row.productName },
    {
      key: "type",
      header: "نوع تغییر",
      render: (row) => (row.changeType === "increase" ? "افزایش" : "کاهش"),
    },
    { key: "amount", header: "مقدار", render: (row) => formatNumber(row.amount) },
    { key: "date", header: "تاریخ", render: (row) => formatDateTime(row.createdAt) },
    { key: "note", header: "توضیحات", render: (row) => row.note || "-" },
    { key: "by", header: "ثبت کننده", render: (row) => row.createdBy },
  ];

  return <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} />;
}
