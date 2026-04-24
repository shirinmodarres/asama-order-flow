import type { Metadata } from "next";
import { ExpertStoreProvider } from "@/components/expert/expert-store-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "آساما | سامانه داخلی عملیات",
  description: "پروتوتایپ پنل داخلی سفارش، انبار، پشتیبانی و فاکتور برای برند آساما",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className="h-full scroll-smooth antialiased"
    >
      <body className="min-h-full bg-[var(--color-page)] text-[var(--color-foreground)]">
        <ExpertStoreProvider>{children}</ExpertStoreProvider>
      </body>
    </html>
  );
}
