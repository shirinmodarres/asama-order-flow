"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JalaliDateInput } from "@/components/shared/jalali-date-input";
import { isoToJalaliDisplay } from "@/lib/utils/jalali-date";

export interface DateRangeValue {
  from?: string | null;
  to?: string | null;
}

interface DateRangeFilterProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  label?: string;
  placeholder?: string;
}

export function DateRangeFilter({
  value,
  onChange,
  label = "بازه زمانی",
  placeholder = "انتخاب بازه زمانی",
}: DateRangeFilterProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({
    top: 0,
    left: 0,
  });
  const [draftFrom, setDraftFrom] = useState(value.from ?? "");
  const [draftTo, setDraftTo] = useState(value.to ?? "");

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(window.innerWidth - 16, 320);
    const left = Math.min(
      Math.max(rect.right - width, 8),
      window.innerWidth - width - 8,
    );
    const top = Math.min(rect.bottom + 8, window.innerHeight - 380);
    setPopoverPosition({ top: Math.max(top, 8), left });
  }, [isOpen]);

  const displayText = formatRangeLabel(value, placeholder);
  const popover =
    isOpen
      ? createPortal(
          <div className="fixed inset-0 z-[120]">
            <button
              type="button"
              aria-label="بستن فیلتر تاریخ"
              className="absolute inset-0 bg-transparent"
              onClick={() => setIsOpen(false)}
            />
            <div
              className="absolute z-[121] w-[min(calc(100vw-1rem),20rem)] rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.16)]"
              style={{
                top: popoverPosition.top,
                left: popoverPosition.left,
              }}
            >
              <div className="grid gap-3">
                <JalaliDateInput
                  label="از تاریخ"
                  value={draftFrom}
                  onChange={setDraftFrom}
                  placeholder="انتخاب تاریخ"
                />
                <JalaliDateInput
                  label="تا تاریخ"
                  value={draftTo}
                  onChange={setDraftTo}
                  placeholder="انتخاب تاریخ"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDraftFrom("");
                    setDraftTo("");
                    onChange({ from: null, to: null });
                    setIsOpen(false);
                  }}
                >
                  پاک کردن
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onChange({
                      from: draftFrom || null,
                      to: draftTo || null,
                    });
                    setIsOpen(false);
                  }}
                >
                  اعمال
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={containerRef}
      className="relative grid w-full min-w-0 gap-2 text-sm font-medium text-[#334155] xl:max-w-[18rem]"
    >
      <span>{label}</span>
      <button
        ref={triggerRef}
        type="button"
        className="flex h-10 w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-[#D8E1EA] bg-white px-3 text-right text-sm text-[#334155] transition-colors hover:border-[#C8D3DF]"
        onClick={() => {
          if (!isOpen) {
            setDraftFrom(value.from ?? "");
            setDraftTo(value.to ?? "");
          }
          setIsOpen(!isOpen);
        }}
      >
        <span className={value.from || value.to ? "" : "text-[#64748B]"}>
          {displayText}
        </span>
        <CalendarDays className="size-4 shrink-0 text-[#6CAE75]" />
      </button>

      {popover}
    </div>
  );
}

function formatRangeLabel(
  value: DateRangeValue,
  placeholder: string,
): string {
  const from = value.from ? formatFaDate(value.from) : "";
  const to = value.to ? formatFaDate(value.to) : "";

  if (from && to) return `از ${from} تا ${to}`;
  if (from) return `از ${from}`;
  if (to) return `تا ${to}`;
  return placeholder;
}

function formatFaDate(value: string): string {
  return isoToJalaliDisplay(value) || value;
}
