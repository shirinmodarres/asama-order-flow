import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
}

export function DataTable<T>({ columns, rows, rowKey }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-right">
          <thead className="bg-[#F8FAFC]">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={`px-5 py-3 text-xs font-semibold text-[#475569] ${column.className ?? ""}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={rowKey(row)} className={`border-t border-[#E5E7EB] transition-colors hover:bg-[#F8FAFC] ${index % 2 === 1 ? "bg-[#FCFDFE]" : ""}`}>
                {columns.map((column) => (
                  <td key={column.key} className={`px-5 py-4 align-middle text-sm text-[#334155] ${column.className ?? ""}`}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
