"use client";

import { useEffect, useState } from "react";
import type { Product, UpdateInventoryInput } from "@/lib/expert/types";

interface InventoryUpdateModalProps {
  open: boolean;
  product: Product | null;
  initialChangeType?: "increase" | "decrease";
  onClose: () => void;
  onSubmit: (input: UpdateInventoryInput) => void;
}

export function InventoryUpdateModal({ open, product, initialChangeType = "increase", onClose, onSubmit }: InventoryUpdateModalProps) {
  const [changeType, setChangeType] = useState<"increase" | "decrease">("increase");
  const [amount, setAmount] = useState(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setChangeType(initialChangeType);
    setAmount(1);
    setNote("");
  }, [initialChangeType, open]);

  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({
            productId: product.id,
            changeType,
            amount,
            note,
            createdBy: "سارا کریمی",
          });
        }}
        className="w-full max-w-md rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-[#1F3A5F]">به روزرسانی موجودی</h3>
        <p className="mt-1 text-sm text-[#6B7280]">{product.name}</p>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm text-[#334155]">
            <span>نوع تغییر</span>
            <select
              value={changeType}
              onChange={(event) => setChangeType(event.target.value as "increase" | "decrease")}
              className="rounded-[12px] border border-[#E5E7EB] px-3 py-2 outline-none focus:border-[#1F3A5F]"
            >
              <option value="increase">افزایش موجودی</option>
              <option value="decrease">کاهش موجودی</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm text-[#334155]">
            <span>مقدار</span>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              className="rounded-[12px] border border-[#E5E7EB] px-3 py-2 outline-none focus:border-[#1F3A5F]"
            />
          </label>

          <label className="grid gap-1 text-sm text-[#334155]">
            <span>توضیحات</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="min-h-20 rounded-[12px] border border-[#E5E7EB] px-3 py-2 outline-none focus:border-[#1F3A5F]"
            />
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-[12px] border border-[#E5E7EB] px-4 py-2 text-sm text-[#334155]">
            انصراف
          </button>
          <button type="submit" className="rounded-[12px] border border-[#1F3A5F] bg-[#1F3A5F] px-4 py-2 text-sm text-white">
            ثبت تغییر
          </button>
        </div>
      </form>
    </div>
  );
}
