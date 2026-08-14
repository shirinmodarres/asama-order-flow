import { Card } from "@/components/ui/card";
import { formatFaCurrencywithoutRial, formatNumber } from "@/lib/expert/utils";

export interface ManagerBrandSalesRow {
  key: string;
  label: string;
  count: number;
  quantity: number;
  amount: number;
}

interface ManagerBrandSalesCardProps {
  rows: ManagerBrandSalesRow[];
  totalAmount: number;
  totalQuantity: number;
  emptyMessage: string;
}

export function ManagerBrandSalesCard({
  rows,
  totalAmount,
  totalQuantity,
  emptyMessage,
}: ManagerBrandSalesCardProps) {
  const maxPercent = Math.max(1, ...rows.map((row) => row.amount));

  return (
    <Card className="overflow-hidden rounded-[28px] border border-[#DDE7F0] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#E7EDF4] px-5 py-5 text-right sm:px-6">
        <h2 className="text-2xl font-black text-[#102034]">
          فروش ریالی و تعدادی به ازای هر برند
        </h2>
        <p className="mt-2 text-base font-medium text-[#6B7280]">
          مقایسه سهم هر برند در فروش قطعی بازه انتخابی
        </p>
      </div>
      <div className="p-5 sm:p-6">
        {rows.length ? (
          <div className="grid gap-4">
            {rows.map((row) => {
              const percent = Math.round((row.amount / maxPercent) * 100);

              return (
                <div
                  key={row.key}
                  className="rounded-[24px] border border-[#E6EDF4] bg-[#FCFDFE] p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-black text-[#102034]">
                        {row.label}
                      </p>
                      <p className="mt-1 text-sm text-[#6B7280]">
                        {formatNumber(row.count)} سفارش · {formatNumber(row.quantity)} قلم
                      </p>
                    </div>
                    <div className="text-right sm:text-left">
                      <p className="text-sm font-medium text-[#6B7280]">مبلغ فروش</p>
                      <p className="text-xl font-black text-[#102034]">
                        {formatFaCurrencywithoutRial(row.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#EEF3F8]">
                    <div
                      className="h-full rounded-full bg-[#6CAE75]"
                      style={{ width: `${Math.max(percent, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="grid gap-4 md:grid-cols-2">
              <SummaryBox title="مبلغ کل فروش" value={formatFaCurrencywithoutRial(totalAmount)} />
              <SummaryBox title="تعداد کل اقلام" value={formatNumber(totalQuantity)} />
            </div>
          </div>
        ) : (
          <EmptyState message={emptyMessage} />
        )}
      </div>
    </Card>
  );
}

function SummaryBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[#E6EDF4] bg-white px-4 py-4 text-center">
      <p className="text-sm font-medium text-[#6B7280]">{title}</p>
      <p className="mt-2 text-xl font-black text-[#102034]">{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#D7E1EA] bg-[#FBFCFE] px-5 py-8 text-center text-sm text-[#6B7280]">
      {message}
    </div>
  );
}
