import type { DataTableColumn } from "@/components/shared/data-table";
import { DataTable } from "@/components/shared/data-table";

interface InvoiceTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
}

export function InvoiceTable<T>({ columns, rows, rowKey }: InvoiceTableProps<T>) {
  return <DataTable columns={columns} rows={rows} rowKey={rowKey} />;
}
