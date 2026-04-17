import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { ExpertStoreProvider } from "@/components/expert/expert-store-provider";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "پروتوتایپ داشبورد داخلی",
  description: "پروتوتایپ پنل داخلی سفارش، انبار و فاکتور",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#F3F5F8] text-[#111827]">
        <ExpertStoreProvider>{children}</ExpertStoreProvider>
      </body>
    </html>
  );
}
