"use client";

import { useState } from "react";
import { ClipboardPenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CreateExitSlipInput } from "@/lib/expert/types";

interface ExitSlipFormProps {
  orderId: string;
  onSubmit: (input: CreateExitSlipInput) => void;
  submitLabel?: string;
}

export function ExitSlipForm({
  orderId,
  onSubmit,
  submitLabel = "صدور حواله خروج",
}: ExitSlipFormProps) {
  const [slipNumber, setSlipNumber] = useState(
    `SLP-${new Date().getTime().toString().slice(-4)}`,
  );
  const [exitDate, setExitDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [createdBy, setCreatedBy] = useState("رضا کاظمی");
  const [notes, setNotes] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ orderId, slipNumber, exitDate, createdBy, notes });
      }}
      className="contents"
    >
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-[#102034]">
              فرم صدور حواله خروج
            </h3>
            <p className="mt-2 text-sm leading-7 text-[#6B7280]">
              این عملیات به معنی خروج فیزیکی کالا از انبار است.
            </p>
          </div>
          <span className="flex size-11 items-center justify-center rounded-[14px] border border-[#DDE7F0] bg-[#F5F8FB] text-[#1F3A5F]">
            <ClipboardPenLine className="size-5" />
          </span>
        </div>

        <div className="mt-5 grid gap-4">
          <InputField
            label="شماره حواله خروج"
            value={slipNumber}
            onChange={setSlipNumber}
          />
          <InputField
            label="تاریخ خروج"
            value={exitDate}
            onChange={setExitDate}
            type="date"
          />
          <InputField
            label="نام تحویل دهنده / مسئول انبار"
            value={createdBy}
            onChange={setCreatedBy}
          />
          <label className="grid gap-2 text-sm font-medium text-[#334155]">
            <span>توضیحات</span>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-28"
            />
          </label>
        </div>

        <Button type="submit" className="mt-5">
          {submitLabel}
        </Button>
      </Card>
    </form>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "date";
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[#334155]">
      <span>{label}</span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        required
      />
    </label>
  );
}
