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
            <div className="overflow-hidden rounded-[24px] border border-[#E6EDF4] bg-[#FCFDFE]">
              <div className="grid grid-cols-[minmax(0,1.3fr)_8rem_10rem] border-b border-[#E6EDF4] px-4 py-4 text-sm font-bold text-[#102034] sm:px-5">
                <div>برند</div>
                <div className="text-center">تعداد</div>
                <div className="text-left">مبلغ فروش</div>
              </div>

              <div className="divide-y divide-[#E6EDF4]">
                {rows.map((row) => (
                  <div
                    key={row.key}
                    className="grid grid-cols-[minmax(0,1.3fr)_8rem_10rem] items-center gap-3 px-4 py-5 sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-[#102034]">
                        {row.label}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-bold text-[#102034]">
                        {formatNumber(row.quantity)} قلم
                      </p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {formatNumber(row.count)} سفارش
                      </p>
                    </div>

                    <div className="text-left">
                      <p className="text-base font-black text-[#102034]">
                        {formatFaCurrencywithoutRial(row.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
