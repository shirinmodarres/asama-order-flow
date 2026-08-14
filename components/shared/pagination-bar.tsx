"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFaDigits } from "@/lib/utils/number-format";

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getVisiblePages(currentPage, totalPages);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[#475569]">
        {formatFaDigits(totalItems)} مورد
      </p>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronRight className="size-4" />
          قبلی
        </Button>

        {pageNumbers.map((page) => (
          <Button
            key={page}
            type="button"
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            className="min-w-10"
            onClick={() => onPageChange(page)}
          >
            {formatFaDigits(page)}
          </Button>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          بعدی
          <ChevronLeft className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  const pages = new Set<number>([1, totalPages, currentPage]);

  if (currentPage - 1 >= 1) pages.add(currentPage - 1);
  if (currentPage + 1 <= totalPages) pages.add(currentPage + 1);
  if (currentPage - 2 >= 1) pages.add(currentPage - 2);
  if (currentPage + 2 <= totalPages) pages.add(currentPage + 2);

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}
