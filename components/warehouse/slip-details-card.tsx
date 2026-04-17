import { formatDate, formatDateTime } from "@/lib/expert/utils";

interface SlipDetailsCardProps {
  slipNumber: string;
  orderCode: string;
  exitDate: string;
  createdBy: string;
  createdAt: string;
  deliveredAt?: string;
  notes: string;
}

export function SlipDetailsCard({
  slipNumber,
  orderCode,
  exitDate,
  createdBy,
  createdAt,
  deliveredAt,
  notes,
}: SlipDetailsCardProps) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-[#1F3A5F]">اطلاعات حواله</h3>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
        <Item label="شماره حواله" value={slipNumber} />
        <Item label="سفارش مرتبط" value={orderCode} />
        <Item label="تاریخ خروج" value={formatDate(exitDate)} />
        <Item label="مسئول ثبت" value={createdBy} />
        <Item label="زمان ثبت" value={formatDateTime(createdAt)} />
        <Item
          label="زمان تحویل"
          value={deliveredAt ? formatDateTime(deliveredAt) : "-"}
        />
      </dl>
      <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-[#FBFCFD] p-3 text-sm text-[#475569]">
        {notes || "توضیحی ثبت نشده است."}
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#FBFCFD] p-3">
      <dt className="text-xs text-[#6B7280]">{label}</dt>
      <dd className="mt-1 font-medium text-[#1F3A5F]">{value}</dd>
    </div>
  );
}
