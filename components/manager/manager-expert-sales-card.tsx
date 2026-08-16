import { Card } from "@/components/ui/card";
import { formatFaCurrencywithoutRial, formatNumber } from "@/lib/expert/utils";

export interface ManagerSalesRow {
  key: string;
  label: string;
  count: number;
  quantity: number;
  amount: number;
}

interface ManagerExpertSalesCardProps {
  title: string;
  description: string;
  rows: ManagerSalesRow[];
  emptyMessage: string;
}

export function ManagerExpertSalesCard({
  title,
  description,
  rows,
  emptyMessage,
}: ManagerExpertSalesCardProps) {
  return (
    <Card className="overflow-hidden rounded-[28px] border border-[#DDE7F0] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#E7EDF4] px-5 py-5 text-right sm:px-6">
        <h2 className="text-2xl font-black text-[#102034]">{title}</h2>
        <p className="mt-2 text-base font-medium text-[#6B7280]">
          {description}
        </p>
      </div>
      <div className="p-5 sm:p-6">
        {rows.length ? (
          <div className="overflow-hidden rounded-[24px] border border-[#E6EDF4] bg-[#FCFDFE]">
            <div className="grid grid-cols-[minmax(0,1.25fr)_7rem_9rem] border-b border-[#E6EDF4] px-4 py-4 text-sm font-bold text-[#102034] sm:px-5">
              <div>کارشناس</div>
              <div className="text-center">تعداد سفارش</div>
              <div className="text-left">مبلغ فروش (ریال)</div>
            </div>
            <div className="divide-y divide-[#E6EDF4]">
              {rows.map((row, index) => (
                <div
                  key={row.key}
                  className="grid grid-cols-[minmax(0,1.25fr)_7rem_9rem] items-center gap-3 px-4 py-5 sm:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white ${rankColor(index)}`}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#102034] sm:text-[15px]">
                        {row.label}
                      </p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {formatNumber(row.quantity)} قلم
                      </p>
                    </div>
                  </div>
                  <div className="text-center text-sm font-medium text-[#334155]">
                    {formatNumber(row.count)} سفارش
                  </div>
                  <div className="text-left text-sm font-black text-[#102034] sm:text-base">
                    {formatFaCurrencywithoutRial(row.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState message={emptyMessage} />
        )}
      </div>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#D7E1EA] bg-[#FBFCFE] px-5 py-8 text-center text-sm text-[#6B7280]">
      {message}
    </div>
  );
}

function rankColor(index: number): string {
  switch (index) {
    case 0:
      return "bg-[#5FAE66]";
    case 1:
      return "bg-[#7DA9E9]";
    case 2:
      return "bg-[#F3A95A]";
    default:
      return "bg-[#94A3B8]";
  }
}
