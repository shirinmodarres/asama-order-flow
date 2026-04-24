import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface WarehouseActionPanelProps {
  orderId: string;
  showIssueSlip: boolean;
}

export function WarehouseActionPanel({
  orderId,
  showIssueSlip,
}: WarehouseActionPanelProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[#102034]">اقدامات انبار</h3>
          <p className="mt-1 text-sm leading-7 text-[#6B7280]">
            عملیات مربوط به خروج کالا از انبار
          </p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-[14px] border border-[#DDE7F0] bg-[#F5F8FB] text-[#1F3A5F]">
          <PackagePlus className="size-5" />
        </span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {showIssueSlip ? (
          <Button asChild>
            <Link href={`/warehouse/orders/${orderId}/exit-slip`}>
              ثبت حواله خروج
            </Link>
          </Button>
        ) : (
          <Button type="button" variant="outline" disabled>
            ثبت حواله خروج
          </Button>
        )}
      </div>
      {!showIssueSlip ? (
        <p className="mt-3 text-xs leading-6 text-[#6B7280]">
          برای این سفارش قبلا حواله خروج صادر شده است.
        </p>
      ) : null}
    </Card>
  );
}
