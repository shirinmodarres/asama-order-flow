"use client";

import type { ReactNode } from "react";

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  tone?: "success" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
  children?: ReactNode;
}

export function ConfirmationModal({
  open,
  title,
  message,
  confirmText,
  tone = "success",
  onConfirm,
  onCancel,
  busy = false,
  children,
}: ConfirmationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-[#1F3A5F]">{title}</h3>
        <p className="mt-2 text-sm text-[#475569]">{message}</p>
        {children ? <div className="mt-3">{children}</div> : null}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm text-[#334155]"
            disabled={busy}
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-xl border px-4 py-2 text-sm text-white ${
              tone === "danger"
                ? "border-[#B91C1C] bg-[#B91C1C]"
                : "border-[#1F3A5F] bg-[#1F3A5F]"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
