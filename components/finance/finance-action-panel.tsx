interface FinanceActionPanelProps {
  disabled?: boolean;
  disabledReason?: string;
  onIssueInvoice: () => void;
}

export function FinanceActionPanel({ disabled = false, disabledReason, onIssueInvoice }: FinanceActionPanelProps) {
  return (
    <section className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-[#1F3A5F]">اقدام مالی</h3>
      <p className="mt-2 text-sm text-[#6B7280]">
        این مرحله تایید می کند کالای تحویل شده، از نظر مالی نهایی و آماده ثبت فاکتور داخلی است.
      </p>

      <button
        type="button"
        onClick={onIssueInvoice}
        disabled={disabled}
        className="btn-primary mt-4 w-full rounded-[12px] px-4 py-2 text-sm font-medium text-white visited:text-white hover:text-white focus:text-white disabled:cursor-not-allowed disabled:border-[#CBD5E1] disabled:bg-[#CBD5E1]"
      >
        صدور فاکتور
      </button>

      {disabled && disabledReason ? <p className="mt-2 text-xs text-[#B91C1C]">{disabledReason}</p> : null}
    </section>
  );
}
