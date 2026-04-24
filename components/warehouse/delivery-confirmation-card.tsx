"use client";

import { CircleCheckBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DeliveryConfirmationCardProps {
  disabled?: boolean;
  onConfirm: () => void;
}

export function DeliveryConfirmationCard({
  disabled = false,
  onConfirm,
}: DeliveryConfirmationCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[#102034]">
            تایید تحویل به مشتری
          </h3>
          <p className="mt-2 text-sm leading-7 text-[#6B7280]">
            پس از تایید، وضعیت انبار سفارش به «تایید تحویل به مشتری» تغییر می کند.
          </p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-[14px] border border-[#DDE7F0] bg-[#F5F8FB] text-[#6CAE75]">
          <CircleCheckBig className="size-5" />
        </span>
      </div>

      <Button
        type="button"
        variant="success"
        disabled={disabled}
        onClick={onConfirm}
        className="mt-5"
      >
        تایید تحویل به مشتری
      </Button>
    </Card>
  );
}
