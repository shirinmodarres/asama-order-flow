"use client";

import { useState } from "react";
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
      className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
    >
      <h3 className="text-base font-semibold text-[#1F3A5F]">
        فرم صدور حواله خروج
      </h3>
      <p className="mt-2 text-sm text-[#6B7280]">
        این عملیات به معنی خروج فیزیکی کالا از انبار است.
      </p>

      <div className="mt-4 grid gap-3">
        <Input
          label="شماره حواله خروج"
          value={slipNumber}
          onChange={setSlipNumber}
        />
        <Input
          label="تاریخ خروج"
          value={exitDate}
          onChange={setExitDate}
          type="date"
        />
        <Input
          label="نام تحویل دهنده / مسئول انبار"
          value={createdBy}
          onChange={setCreatedBy}
        />
        <label className="grid gap-1 text-sm text-[#334155]">
          <span>توضیحات</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="min-h-24 rounded-xl border border-[#E5E7EB] px-3 py-2 outline-none focus:border-[#1F3A5F]"
          />
        </label>
      </div>

      <button
        type="submit"
        className="mt-4 rounded-xl border border-[#1F3A5F] bg-[#1F3A5F] px-4 py-2 text-sm text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}

function Input({
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
    <label className="grid gap-1 text-sm text-[#334155]">
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        required
        className="rounded-xl border border-[#E5E7EB] px-3 py-2 outline-none focus:border-[#1F3A5F]"
      />
    </label>
  );
}
