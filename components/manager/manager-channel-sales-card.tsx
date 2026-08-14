import { Card } from "@/components/ui/card";
import { formatCurrency, formatFaCurrencywithoutRial, formatNumber } from "@/lib/expert/utils";
import type { ManagerSalesRow } from "@/components/manager/manager-expert-sales-card";

interface ManagerChannelSalesCardProps {
  rows: ManagerSalesRow[];
  totalAmount: number;
  emptyMessage: string;
}

export function ManagerChannelSalesCard({
  rows,
  totalAmount,
  emptyMessage,
}: ManagerChannelSalesCardProps) {
  return (
    <Card className="overflow-hidden rounded-[28px] border border-[#DDE7F0] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[#E7EDF4] px-5 py-5 text-right sm:px-6">
        <h2 className="text-2xl font-black text-[#102034]">
          ترکیب فروش بازار / ناجا
        </h2>
        <p className="mt-2 text-base font-medium text-[#6B7280]">
          نمودار برای مقایسه سهم هر گروه در فروش
        </p>
      </div>
      <div className="p-5 sm:p-6">
        {rows.some((row) => row.amount > 0) ? (
          <div className="grid gap-6">
            <DonutChart rows={rows} total={totalAmount} />
            <div className="grid gap-4 xl:grid-cols-2">
              {rows.map((row) => (
                <ChannelLegendCard key={row.key} row={row} total={totalAmount} />
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

function DonutChart({
  rows,
  total,
}: {
  rows: Array<{ key: string; label: string; count: number; quantity: number; amount: number }>;
  total: number;
}) {
  const [first, second] = rows;
  const firstRatio = total > 0 ? first.amount / total : 0;
  const secondRatio = total > 0 ? second.amount / total : 0;
  const circumference = 2 * Math.PI * 45;
  const firstDash = firstRatio * circumference;
  const secondDash = secondRatio * circumference;

  return (
    <div className="flex items-center justify-center">
      <div className="relative h-56 w-56 sm:h-60 sm:w-60 lg:h-64 lg:w-64">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="45" fill="none" stroke="#EEF3F8" strokeWidth="15" />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#2C4A73"
            strokeWidth="15"
            strokeLinecap="round"
            strokeDasharray={`${firstDash} ${circumference - firstDash}`}
            strokeDashoffset="0"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#6CAE75"
            strokeWidth="15"
            strokeLinecap="round"
            strokeDasharray={`${secondDash} ${circumference - secondDash}`}
            strokeDashoffset={-firstDash}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[12px] font-medium text-[#6B7280]">مبلغ کل فروش</p>
          <p className="mt-2 text-2xl font-black text-[#102034] sm:text-[2rem]">
            {formatCurrency(total)}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChannelLegendCard({
  row,
  total,
}: {
  row: { key: string; label: string; count: number; quantity: number; amount: number };
  total: number;
}) {
  const percent = total > 0 ? Math.round((row.amount / total) * 100) : 0;
  const color = row.key === "naja" ? "bg-[#6CAE75]" : "bg-[#2C4A73]";

  return (
    <div className="rounded-[18px] border border-[#E6EDF4] bg-[#FCFDFE] p-4 text-center">
      <div className="flex items-center justify-center gap-2">
        <span className={`size-2.5 rounded-full ${color}`} />
        <p className="text-sm font-bold text-[#102034]">{row.label}</p>
      </div>

      <p className="mt-3 text-xl font-black text-[#102034] sm:text-2xl">
        {formatFaCurrencywithoutRial(row.amount)}
      </p>

      <p className="mt-2 text-xs font-medium text-[#6B7280]">
        {formatNumber(percent)}٪
      </p>

      <div className="mt-4 flex items-center justify-center gap-5 text-xs text-[#6B7280]">
        <span>تعداد سفارش: {formatNumber(row.count)}</span>
        <span>تعداد اقلام: {formatNumber(row.quantity)}</span>
      </div>
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
