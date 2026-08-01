"use client";

import { useEffect, useMemo, useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { FieldError } from "@/components/shared/field-error";
import { InlineErrorMessage } from "@/components/shared/inline-error-message";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api/api-error";
import { formatCurrency, formatNumber } from "@/lib/expert/utils";
import type { Customer } from "@/lib/models/customer.model";
import type { Product } from "@/lib/models/product.model";
import type {
  CreateSalesQuotationPayload,
  SalesQuotation,
  SalesQuotationItem,
} from "@/lib/models/sales-quotation.model";
import { getStoredCurrentUser } from "@/lib/services/auth.service";
import { listAssignedCustomersForExpert } from "@/lib/services/expert-customer.service";
import { listQuotationProductsForAssignment } from "@/lib/services/product.service";
import { listActiveSalesTypes } from "@/lib/services/sales-type.service";
import { formatFaDigits, normalizeDigits, toNumber } from "@/lib/utils/number-format";
import { JalaliDateInput } from "@/components/shared/jalali-date-input";
import { SELECT_REQUIRED_MESSAGE, POSITIVE_NUMBER_MESSAGE } from "@/lib/utils/form-validation";
import { jalaliToIso, todayJalaliParts } from "@/lib/utils/jalali-date";

interface QuotationFormProps {
  mode: "create" | "edit";
  initialQuotation?: SalesQuotation | null;
  submitLabel: string;
  isSubmitting?: boolean;
  assignedCustomersOnly?: boolean;
  onSubmit: (payload: CreateSalesQuotationPayload) => Promise<void>;
  onCancel?: () => void;
}

interface DraftRow {
  rowId: string;
  productId: string;
  quantity: number;
}

interface PriceListOption {
  value: string;
  label: string;
}

interface SalesTypeOption {
  objectId: string;
  title: string;
  internalCode?: number | null;
  sepidarCode?: number | null;
}

function getQuotationSalesTypeSnapshot(quotation?: SalesQuotation | null): SalesTypeOption | null {
  if (!quotation) return null;
  const objectId =
    quotation.salesTypeObjectId ||
    quotation.salesType?.objectId ||
    "";
  const title =
    quotation.salesTypeTitle ||
    quotation.salesType?.title ||
    "";
  const internalCode =
    quotation.salesTypeInternalCode ??
    quotation.salesType?.internalCode ??
    null;
  const sepidarCode =
    quotation.salesTypeSepidarCode ??
    quotation.salesType?.sepidarCode ??
    null;
  if (!objectId && !title && internalCode === null && sepidarCode === null) return null;
  return {
    objectId: objectId || `quotation-sales-type-${quotation.objectId || "fallback"}`,
    title,
    internalCode,
    sepidarCode,
  };
}

export function QuotationForm({
  mode,
  initialQuotation,
  submitLabel,
  isSubmitting = false,
  assignedCustomersOnly = true,
  onSubmit,
  onCancel,
}: QuotationFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [error, setError] = useState("");
  const [customerError, setCustomerError] = useState("");
  const [productError, setProductError] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    initialQuotation?.customerObjectId || initialQuotation?.customer?.objectId || "",
  );
  const [selectedPriceListId, setSelectedPriceListId] = useState(
    initialQuotation?.priceListObjectId || initialQuotation?.priceListId || "",
  );
  const [salesTypes, setSalesTypes] = useState<SalesTypeOption[]>([]);
  const [selectedSalesTypeId, setSelectedSalesTypeId] = useState(
    initialQuotation?.salesTypeObjectId ||
      initialQuotation?.salesType?.objectId ||
      "",
  );
  const [selectedValidUntil, setSelectedValidUntil] = useState(
    initialQuotation?.validUntil?.slice(0, 10) || (() => {
      const [year, month, day] = todayJalaliParts();
      return jalaliToIso(year, month, day);
    })(),
  );
  const [notes, setNotes] = useState(initialQuotation?.notes || "");
  const [rows, setRows] = useState<DraftRow[]>(
    initialQuotation?.items?.length
      ? initialQuotation.items.map((item, index) => ({
          rowId: `initial-${index}-${item.productObjectId}`,
          productId: item.productObjectId,
          quantity: item.quantity,
        }))
      : [createEmptyRow(0)],
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [rowErrors, setRowErrors] = useState<
    Record<string, { productId?: string; quantity?: string }>
  >({});
  const [discountPercentage, setDiscountPercentage] = useState(
    initialQuotation?.discountPercentage ?? 0,
  );
  const [taxPercentage, setTaxPercentage] = useState(
    initialQuotation?.taxPercentage ?? 10,
  );
  const quotationSalesTypeFallback = useMemo(
    () => getQuotationSalesTypeSnapshot(initialQuotation),
    [initialQuotation],
  );
  const quotationCustomerFallback = useMemo(() => {
    if (!initialQuotation?.customer) return null;
    return {
      ...initialQuotation.customer,
      objectId: initialQuotation.customerObjectId || initialQuotation.customer.objectId,
      id: initialQuotation.customer.id || initialQuotation.customerObjectId || initialQuotation.customer.objectId,
      fullName:
        initialQuotation.customer.fullName ||
        initialQuotation.customerObjectId ||
        "",
    };
  }, [initialQuotation]);

  useEffect(() => {
    let mounted = true;
    async function loadSalesTypes() {
      try {
        const data = await listActiveSalesTypes();
        if (!mounted) return;
        const normalizedSalesTypes = data.map((salesType) => ({
          objectId: salesType.objectId,
          title: salesType.title,
          internalCode: salesType.internalCode,
          sepidarCode: salesType.sepidarCode,
        }));
        if (quotationSalesTypeFallback) {
          const exists = normalizedSalesTypes.some(
            (salesType) => salesType.objectId === quotationSalesTypeFallback.objectId,
          );
          if (!exists) {
            normalizedSalesTypes.push({
              objectId: quotationSalesTypeFallback.objectId,
              title: quotationSalesTypeFallback.title,
              internalCode: quotationSalesTypeFallback.internalCode ?? null,
              sepidarCode: quotationSalesTypeFallback.sepidarCode ?? null,
            });
          }
        }
        setSalesTypes(normalizedSalesTypes);
        if (!selectedSalesTypeId) {
          setSelectedSalesTypeId(quotationSalesTypeFallback?.objectId || "");
        }
      } catch {
        if (mounted) setSalesTypes([]);
      }
    }
    async function loadCustomers() {
      setIsLoadingCustomers(true);
      setCustomerError("");
      try {
        const data = await listAssignedCustomersForExpert(getStoredCurrentUser()?.objectId);
        if (!mounted) return;
        const normalizedCustomers = [...data];
        if (
          quotationCustomerFallback &&
          !normalizedCustomers.some(
            (customer) => customer.objectId === quotationCustomerFallback.objectId,
          )
        ) {
          normalizedCustomers.unshift(quotationCustomerFallback);
        }
        setCustomers(normalizedCustomers);
        if (!selectedCustomerId && data.length === 1) {
          setSelectedCustomerId(data[0].objectId);
        }
      } catch (loadError) {
        if (mounted) setCustomerError(getErrorMessage(loadError));
      } finally {
        if (mounted) setIsLoadingCustomers(false);
      }
    }
    loadSalesTypes();
    loadCustomers();
    return () => {
      mounted = false;
    };
  }, [
    initialQuotation?.salesType?.objectId,
    initialQuotation?.salesTypeObjectId,
    quotationCustomerFallback,
    selectedSalesTypeId,
  ]);

  const selectedCustomer = useMemo(
    () =>
      customers.find((customer) => customer.objectId === selectedCustomerId) ??
      (quotationCustomerFallback && quotationCustomerFallback.objectId === selectedCustomerId
        ? quotationCustomerFallback
        : null),
    [customers, quotationCustomerFallback, selectedCustomerId],
  );

  const priceListOptions = useMemo(() => {
    const options: PriceListOption[] = [];
    const seen = new Set<string>();
    const addOption = (value: string | null | undefined, label: string | null | undefined) => {
      if (!value || seen.has(value)) return;
      seen.add(value);
      options.push({ value, label: label || value });
    };
    const priceLists = selectedCustomer?.priceLists || [];
    priceLists.forEach((priceList) => {
      addOption(priceList.objectId, priceList.title || priceList.displayName || priceList.name);
    });
    addOption(selectedCustomer?.priceListId, selectedCustomer?.priceListTitle);
    // if (!options.length && selectedCustomer?.saleType?.objectId) {
    //   addOption(selectedCustomer.priceListId || selectedCustomer.saleType.objectId, selectedCustomer.saleType.title);
    // }
    return options;
  }, [selectedCustomer]);
  const mergedSalesTypes = useMemo(() => {
    const map = new Map<string, SalesTypeOption>();
    salesTypes.forEach((salesType) => {
      map.set(salesType.objectId, salesType);
    });
    if (
      quotationSalesTypeFallback &&
      !map.has(quotationSalesTypeFallback.objectId) &&
      (quotationSalesTypeFallback.objectId ||
        quotationSalesTypeFallback.title ||
        quotationSalesTypeFallback.internalCode !== null ||
        quotationSalesTypeFallback.sepidarCode !== null)
    ) {
      map.set(quotationSalesTypeFallback.objectId, quotationSalesTypeFallback);
    }
    return Array.from(map.values());
  }, [quotationSalesTypeFallback, salesTypes]);

  useEffect(() => {
    if (!selectedCustomer) {
      if (quotationCustomerFallback && quotationCustomerFallback.objectId === selectedCustomerId) {
        const fallbackPriceLists = quotationCustomerFallback.priceLists || [];
        const fallbackOptions = fallbackPriceLists
          .map((priceList) => ({
            value: priceList.objectId,
            label: priceList.title || priceList.displayName || priceList.name,
          }))
          .filter((option) => Boolean(option.value));
        if (fallbackPriceLists.length) {
          setSelectedPriceListId((current) => {
            if (current && fallbackOptions.some((option) => option.value === current)) return current;
            return (
              initialQuotation?.priceListObjectId &&
              fallbackOptions.some((option) => option.value === initialQuotation.priceListObjectId)
            )
              ? initialQuotation.priceListObjectId
              : fallbackOptions[0].value;
          });
          return;
        }
      }
      setProducts([]);
      setSelectedPriceListId("");
      return;
    }
    if (priceListOptions.length > 0) {
      setSelectedPriceListId((current) => {
        if (current && priceListOptions.some((option) => option.value === current)) return current;
        return selectedCustomer.priceListId && priceListOptions.some((option) => option.value === selectedCustomer.priceListId)
          ? selectedCustomer.priceListId
          : priceListOptions[0].value;
      });
    }
  }, [
    initialQuotation?.priceListObjectId,
    priceListOptions,
    quotationCustomerFallback,
    selectedCustomer,
    selectedCustomerId,
  ]);

  useEffect(() => {
    let mounted = true;
    async function loadProducts() {
      if (!selectedCustomerId || !selectedPriceListId) {
        setProducts([]);
        return;
      }
      setIsLoadingProducts(true);
      setProductError("");
      try {
        const data = await listQuotationProductsForAssignment(
          {
            customerObjectId: selectedCustomerId,
            priceListId: selectedPriceListId,
            expertUserId: getStoredCurrentUser()?.objectId,
          },
        );
        if (!mounted) return;
        setProducts(data);
        if (mode === "edit" && initialQuotation) {
          const itemRows = mapQuotationItems(initialQuotation.items);
          setRows(itemRows);
        }
      } catch (loadError) {
        if (mounted) setProductError(getErrorMessage(loadError));
      } finally {
        if (mounted) setIsLoadingProducts(false);
      }
    }

    loadProducts();
    return () => {
      mounted = false;
    };
  }, [initialQuotation, mode, selectedCustomerId, selectedPriceListId]);

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        value: product.objectId,
        label: [
          product.sepidarCode || product.sku,
          product.name,
        ].filter(Boolean).join(" - "),
        description: product.brandName || undefined,
        searchText: [
          product.sepidarCode,
          product.sku,
          product.name,
          product.brandName,
        ]
          .filter(Boolean)
          .join(" "),
      })),
    [products],
  );

  const productsById = useMemo(
    () =>
      products.reduce<Record<string, Product>>((accumulator, product) => {
        accumulator[product.objectId] = product;
        return accumulator;
      }, {}),
    [products],
  );

  const resolvedRows = useMemo(
    () =>
      rows
        .filter((row) => row.productId && row.quantity > 0)
        .map((row) => {
          const product = productsById[row.productId];
          const unitPrice = product?.unitPrice ?? 0;
          const lineSubtotal = row.quantity * unitPrice;
          const lineTotal = Math.max(0, lineSubtotal);
          return {
            ...row,
            unitPrice,
            lineSubtotal,
            lineTotal,
            productName: product?.name || "",
            productSku: product?.sepidarCode || product?.sku || "",
          };
        }),
    [productsById, rows],
  );

  const subtotal = resolvedRows.reduce((sum, row) => sum + row.lineTotal, 0);
  const discountAmount = subtotal * (discountPercentage / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * (taxPercentage / 100);
  const total = taxableAmount + taxAmount;
  const itemCount = resolvedRows.length;
  const totalQuantity = resolvedRows.reduce((sum, row) => sum + row.quantity, 0);

  const addRow = () => {
    setRows((current) => [...current, createEmptyRow(current.length)]);
  };

  const removeRow = (rowId: string) => {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.rowId !== rowId) : current));
  };

  const updateRow = (rowId: string, patch: Partial<DraftRow>) => {
    setRows((current) =>
      current.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)),
    );
    setRowErrors((current) => ({
      ...current,
      [rowId]: {
        ...(patch.productId !== undefined ? { productId: "" } : {}),
        ...(patch.quantity !== undefined ? { quantity: "" } : {}),
      },
    }));
  };

  const submit = async (status: "draft" | "finalized") => {
    setError("");
    setRowErrors({});
    const nextRowErrors: Record<string, { productId?: string; quantity?: string }> = {};

    if (!selectedCustomerId) {
      setError("لطفاً مشتری را انتخاب کنید.");
      return;
    }
    if (!selectedSalesTypeId) {
      setError("لطفاً روش پرداخت را انتخاب کنید.");
      return;
    }
    if (!selectedPriceListId) {
      setError("لطفاً لیست قیمت را انتخاب کنید.");
      return;
    }

    if (resolvedRows.length === 0) {
      setError("حداقل یک کالا اضافه کنید.");
      return;
    }

    for (const row of rows) {
      const rowErrors: { productId?: string; quantity?: string } = {};
      if (!row.productId) {
        rowErrors.productId = SELECT_REQUIRED_MESSAGE;
      } else if (!productsById[row.productId]) {
        rowErrors.productId = "این کالا در لیست قیمت انتخاب‌شده موجود نیست.";
      }
      if (!Number.isFinite(row.quantity) || row.quantity <= 0) {
        rowErrors.quantity = POSITIVE_NUMBER_MESSAGE;
      }
      if (Object.keys(rowErrors).length) {
        nextRowErrors[row.rowId] = rowErrors;
      }
    }

    if (Object.keys(nextRowErrors).length) {
      setRowErrors(nextRowErrors);
      return;
    }

    await onSubmit({
      customerObjectId: selectedCustomerId,
      salesTypeObjectId: selectedSalesTypeId,
      priceListObjectId: selectedPriceListId,
      notes: notes.trim(),
      validUntil: selectedValidUntil || null,
      discountPercentage,
      taxPercentage,
      status,
      items: resolvedRows.map((row) => ({
        productObjectId: row.productId,
        quantity: row.quantity,
      })),
    });
  };

  if (isLoadingCustomers) {
    return <LoadingState title="در حال دریافت مشتری‌ها" />;
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-[#334155]">
            <span>مشتری</span>
            <SearchableSelect
              value={selectedCustomerId || undefined}
              onValueChange={(value) => {
                setSelectedCustomerId(value);
                setRows([createEmptyRow(0)]);
                setProducts([]);
                setSelectedPriceListId("");
              }}
            options={
              quotationCustomerFallback &&
              !customers.some(
                (customer) => customer.objectId === quotationCustomerFallback.objectId,
              )
                ? [
                    {
                      value: quotationCustomerFallback.objectId,
                      label: [
                        quotationCustomerFallback.sepidarCustomerCode ||
                          quotationCustomerFallback.id,
                        quotationCustomerFallback.fullName,
                      ]
                        .filter(Boolean)
                        .join(" - "),
                    },
                    ...customers.map((customer) => ({
                      value: customer.objectId,
                      label: [
                        customer.sepidarCustomerCode || customer.id,
                        customer.fullName,
                      ]
                        .filter(Boolean)
                        .join(" - "),
                    })),
                  ]
                : customers.map((customer) => ({
                    value: customer.objectId,
                    label: [
                      customer.sepidarCustomerCode || customer.id,
                      customer.fullName,
                    ]
                      .filter(Boolean)
                      .join(" - "),
                  }))
            }
            placeholder="انتخاب مشتری"
            searchPlaceholder="جستجو در مشتری‌ها"
            emptyMessage={assignedCustomersOnly ? "مشتری پیدا نشد" : "مشتری یافت نشد"}
          />
            <FieldError message={customerError} />
          </label>
          <label className="grid content-start gap-1.5 text-sm font-medium text-[#334155]">    
          <span>روش پرداخت</span>
            <SearchableSelect
              value={selectedSalesTypeId || undefined}
              onValueChange={setSelectedSalesTypeId}
              options={mergedSalesTypes.map((salesType) => ({
                value: salesType.objectId,
                label: salesType.title,
                searchText: [salesType.title, salesType.internalCode]
                  .filter(Boolean)
                  .join(" "),
              }))}
              placeholder="انتخاب روش پرداخت"
              searchPlaceholder="جستجو در روش پرداخت"
              emptyMessage="روش پرداختی پیدا نشد"
            />
          </label>
          <label className="grid content-start gap-1.5 text-sm font-medium text-[#334155]">  
            <span>لیست قیمت</span>
            <SearchableSelect
              value={selectedPriceListId || undefined}
              onValueChange={setSelectedPriceListId}
              options={priceListOptions}
              placeholder="انتخاب لیست قیمت"
              searchPlaceholder="جستجو در لیست قیمت"
              emptyMessage="لیست قیمتی پیدا نشد"
              disabled={!selectedCustomerId || priceListOptions.length === 0}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-[#334155]">
            <JalaliDateInput
              value={selectedValidUntil}
              onChange={setSelectedValidUntil}
              placeholder="انتخاب تاریخ اعتبار"
              label="اعتبار تا تاریخ"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-[#334155] md:col-span-2">
            <span>توضیحات</span>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="یادداشت‌های پیش فاکتور"
            />
          </label>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-[#334155]">
            <span>درصد تخفیف کل</span>
            <Input
              type="number"
              min={0}
              max={100}
              value={discountPercentage}
              onChange={(event) => {
                const value = Math.min(100, Math.max(0, toNumber(normalizeDigits(event.target.value))));
                setDiscountPercentage(value);
              }}
              placeholder="0"
              inputMode="numeric"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-[#334155]">
            <span>درصد مالیات</span>
            <Input
              type="text"
              inputMode="numeric"
              min={0}
              max={100}
              value={taxPercentage}
              onChange={(event) => {
                const value = Math.min(100, Math.max(0, toNumber(normalizeDigits(event.target.value))));
                setTaxPercentage(value);
              }}
              placeholder="10"
            />
          </label>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-[#1F3A5F]">اقلام پیش فاکتور</h3>
            <Button type="button" variant="outline" onClick={addRow}>
              <PlusCircle className="ml-2 size-4" />
              افزودن کالا
            </Button>
          </div>
          {productError ? <InlineErrorMessage message={productError} /> : null}
          {isLoadingProducts ? <LoadingState title="در حال دریافت کالاها" /> : null}
          <div className="space-y-3">
            {rows.map((row) => {
              const product = productsById[row.productId];
              const unitPrice = product?.unitPrice ?? 0;
              const lineTotal = Math.max(0, row.quantity * unitPrice);
              return (
                <div
                  key={row.rowId}
                  className="grid gap-3 rounded-2xl border border-[#E5E7EB] bg-[#FBFCFD] p-4"
                >
                  <div>
                    <SearchableSelect
                      value={row.productId || undefined}
                      onValueChange={(value) => updateRow(row.rowId, { productId: value })}
                      options={productOptions}
                      placeholder="انتخاب کالا"
                      searchPlaceholder="جستجو در کالاها"
                      emptyMessage="کالایی پیدا نشد"
                      invalid={Boolean(rowErrors[row.rowId]?.productId)}
                    />
                    <FieldError message={rowErrors[row.rowId]?.productId} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[120px_140px_140px_auto] xl:grid-cols-[120px_140px_140px_auto]">
                    <div>
                      <Input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(event) => updateRow(row.rowId, { quantity: toNumber(event.target.value) })}
                        placeholder="تعداد"
                      />
                      <FieldError message={rowErrors[row.rowId]?.quantity} />
                    </div>
                    <Input value={formatCurrency(unitPrice)} readOnly disabled />
                    <Input value={formatCurrency(lineTotal)} readOnly disabled />
                    <div className="flex items-center justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(row.rowId)}
                        disabled={rows.length === 1}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="p-5">
          <h3 className="text-base font-semibold text-[#1F3A5F]">خلاصه پیش فاکتور</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <SummaryRow label="مشتری" value={selectedCustomer?.fullName || "-"} />
            {selectedSalesTypeId ? (
              <SummaryRow
                label="روش پرداخت"
                value={
                  salesTypes.find((salesType) => salesType.objectId === selectedSalesTypeId)?.title ||
                  selectedSalesTypeId
                }
              />
            ) : null}
            {selectedPriceListId ? (
              <SummaryRow
                label="لیست قیمت"
                value={
                  priceListOptions.find((option) => option.value === selectedPriceListId)?.label ||
                  selectedPriceListId
                }
              />
            ) : null}
            <SummaryRow label="تعداد آیتم" value={formatNumber(itemCount)} />
            <SummaryRow label="جمع تعداد" value={formatNumber(totalQuantity)} />
            <SummaryRow label="جمع مبلغ اقلام" value={formatCurrency(subtotal)} />
            <SummaryRow label="درصد تخفیف کل" value={`${formatNumber(discountPercentage)}%`} />
            <SummaryRow label="مبلغ تخفیف" value={formatCurrency(discountAmount)} />
            <SummaryRow label="مبلغ مشمول مالیات" value={formatCurrency(taxableAmount)} />
            <SummaryRow label="مالیات ۱۰٪" value={formatCurrency(taxAmount)} />
            <SummaryRow label="جمع کل" value={formatCurrency(total)} />
          </dl>
        </Card>

        <div className="flex flex-col gap-3">
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              انصراف
            </Button>
          ) : null}
          <Button type="button" disabled={isSubmitting} onClick={() => submit("draft")}>
            {submitLabel}
          </Button>
          <Button type="button" disabled={isSubmitting} variant="secondary" onClick={() => submit("finalized")}>
            نهایی‌سازی
          </Button>
        </div>
      </div>
    </section>
  );
}

function createEmptyRow(index: number): DraftRow {
  return {
    rowId: `row-${Date.now()}-${index}`,
    productId: "",
    quantity: 1,
  };
}

function mapQuotationItems(items: SalesQuotationItem[]): DraftRow[] {
  return items.length
      ? items.map((item, index) => ({
        rowId: `quotation-${index}-${item.productObjectId}`,
        productId: item.productObjectId,
        quantity: item.quantity,
      }))
    : [createEmptyRow(0)];
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E8EEF4] bg-[#FBFCFD] px-3.5 py-3">
      <dt className="text-[#6B7280]">{label}</dt>
      <dd className="font-semibold text-[#102034]">{value}</dd>
    </div>
  );
}
