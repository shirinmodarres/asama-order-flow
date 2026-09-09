"use client";
import { Toaster as Sonner } from "sonner";
export function Toaster() {
  return <Sonner position="top-center" dir="rtl" richColors closeButton toastOptions={{ className: "font-[inherit]" }} />;
}
