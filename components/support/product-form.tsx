"use client";

import { useState } from "react";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "@/lib/expert/types";

interface BaseProps {
  onCancel: () => void;
}

interface CreateModeProps extends BaseProps {
  mode: "create";
  onSubmit: (input: CreateProductInput) => void;
}

interface EditModeProps extends BaseProps {
  mode: "edit";
  initialValues: {
    id: string;
    name: string;
    brand: string;
    category: string;
    description?: string;
    status: "active" | "inactive";
  };
  onSubmit: (input: UpdateProductInput) => void;
}

type ProductFormProps = CreateModeProps | EditModeProps;

export function ProductForm(props: ProductFormProps) {
  const [name, setName] = useState(
    props.mode === "edit" ? props.initialValues.name : "",
  );
  const [brand, setBrand] = useState(
    props.mode === "edit" ? props.initialValues.brand : "",
  );
  const [category, setCategory] = useState(
    props.mode === "edit" ? props.initialValues.category : "",
  );
  const [description, setDescription] = useState(
    props.mode === "edit" ? (props.initialValues.description ?? "") : "",
  );
  const [initialStock, setInitialStock] = useState(0);
  const [status, setStatus] = useState<"active" | "inactive">(
    props.mode === "edit" ? props.initialValues.status : "active",
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        if (props.mode === "create") {
          props.onSubmit({ name, brand, category, initialStock, description });
          return;
        }

        props.onSubmit({
          id: props.initialValues.id,
          name,
          brand,
          category,
          description,
          status,
        });
      }}
      className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="نام کالا" value={name} onChange={setName} />
        <Input label="برند" value={brand} onChange={setBrand} />
        <Input label="دسته بندی" value={category} onChange={setCategory} />

        {props.mode === "create" ? (
          <label className="grid gap-1 text-sm text-[#334155]">
            <span>موجودی اولیه</span>
            <input
              type="number"
              min={0}
              value={initialStock}
              onChange={(event) => setInitialStock(Number(event.target.value))}
              className="rounded-xl border border-[#E5E7EB] px-3 py-2 outline-none focus:border-[#1F3A5F]"
              required
            />
          </label>
        ) : (
          <label className="grid gap-1 text-sm text-[#334155]">
            <span>وضعیت</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "active" | "inactive")
              }
              className="rounded-xl border border-[#E5E7EB] px-3 py-2 outline-none focus:border-[#1F3A5F]"
            >
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </select>
          </label>
        )}
      </div>

      <label className="mt-3 grid gap-1 text-sm text-[#334155]">
        <span>توضیحات کوتاه</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-24 rounded-xl border border-[#E5E7EB] px-3 py-2 outline-none focus:border-[#1F3A5F]"
        />
      </label>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="rounded-xl border border-[#1F3A5F] bg-[#1F3A5F] px-4 py-2 text-sm text-white"
        >
          {props.mode === "create" ? "ثبت کالا" : "ذخیره تغییرات"}
        </button>
        <button
          type="button"
          onClick={props.onCancel}
          className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm text-[#334155]"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-sm text-[#334155]">
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="rounded-xl border border-[#E5E7EB] px-3 py-2 outline-none focus:border-[#1F3A5F]"
      />
    </label>
  );
}
