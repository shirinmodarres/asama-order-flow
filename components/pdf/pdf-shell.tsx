"use client";

import Image from "next/image";
import type { ReactNode } from "react";

export const PDF_PAGE_STYLES = String.raw`
  @media print {
    @page {
      size: A4 portrait;
      margin: 0;
    }
    html,
    body {
      width: 100%;
      min-height: 297mm;
      margin: 0 !important;
      background: white !important;
      overflow: visible !important;
      box-sizing: border-box !important;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .no-print {
      display: none !important;
    }
    body * {
      visibility: hidden !important;
    }
    .pdf-page,
    .pdf-page * {
      visibility: visible !important;
    }
    .pdf-page {
      position: relative !important;
      inset: auto !important;
    }
    .pdf-page {
      box-shadow: none !important;
      border: 0 !important;
      width: 210mm !important;
      margin: 0 !important;
      min-height: 297mm !important;
      border-radius: 0 !important;
      overflow: visible !important;
      box-sizing: border-box !important;
    }
    .page-break-after {
      break-after: page;
      page-break-after: always;
    }
    .pdf-page:last-child {
      break-after: auto;
      page-break-after: auto;
    }
    .print-content {
      padding: 18mm 20mm 16mm 20mm !important;
      overflow: visible !important;
      box-sizing: border-box !important;
    }
    .print-section,
    .print-table-row {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .items-table thead {
      display: table-header-group;
    }
    .items-table {
      width: 100% !important;
      table-layout: fixed !important;
      box-sizing: border-box !important;
      margin-inline: 0 !important;
    }
    .items-table th,
    .items-table td {
      white-space: normal !important;
      overflow-wrap: anywhere !important;
      word-break: break-word !important;
    }
    .print-root {
      font-size: 11px !important;
      line-height: 1.9 !important;
    }
  }
`;

export function PdfPage({
  children,
  pageBreakAfter = false,
  imageSrc = "/A4 - 2.svg",
  imageAlt = "Asama Letterhead",
  className = "",
}: {
  children: ReactNode;
  pageBreakAfter?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}) {
  return (
    <section
      className={`pdf-page relative mx-auto min-h-[297mm] w-full max-w-[210mm] overflow-visible rounded-lg border border-[#D7DEE6] bg-white shadow-sm ${
        pageBreakAfter ? "page-break-after" : ""
      } ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 z-0 opacity-100">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="210mm"
          className="object-cover"
        />
      </div>
      <div className="print-content print-root relative z-10">{children}</div>
    </section>
  );
}
