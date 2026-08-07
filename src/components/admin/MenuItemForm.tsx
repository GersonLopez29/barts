"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, FormEvent, ChangeEvent } from "react";
import Image from "next/image";

type CategoryOption = { name: string; icon: string };

type MenuItemFormProps =
  | {
      mode: "create";
      categories: CategoryOption[];
      onDone?: () => void;
    }
  | {
      mode: "edit";
      itemId: string;
      categories: CategoryOption[];
      initialName: string;
      initialDescription: string;
      initialPrice: number;
      initialCategory: string;
      initialImageUrl: string | null;
      onDone?: () => void;
    };

export default function MenuItemForm(props: MenuItemFormProps) {
  const router = useRouter();
  const isEdit = props.mode === "edit";

  const [name, setName] = useState(isEdit ? props.initialName : "");
  const [description, setDescription] = useState(isEdit ? props.initialDescription : "");
  const [price, setPrice] = useState(isEdit ? String(props.initialPrice) : "");
  const [category, setCategory] = useState(
    isEdit ? props.initialCategory : (props.categories[0]?.name ?? "")
  );
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl] = useState<string | null>(isEdit ? props.initialImageUrl : null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected && selected.type.startsWith("image/")) {
      setFile(selected);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("description", description);
    formData.set("price", price);
    formData.set("category", category);
    if (file) formData.set("image", file);

    const url = isEdit ? `/api/admin/menu-items/${props.itemId}` : "/api/admin/menu-items";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, { method, body: formData });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Ocurrió un error, intenta de nuevo");
      return;
    }

    if (!isEdit) {
      setName("");
      setDescription("");
      setPrice("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }

    props.onDone?.();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Nombre</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-100"
          >
            {props.categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">Descripción</label>
        <textarea
          required
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-100"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Precio (S/)</label>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
              S/
            </span>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 py-2 pl-9 pr-3 text-sm focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-100"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Foto</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={handleFileSelected}
            className="mt-1 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-full file:border-0 file:bg-red-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-red-700 hover:file:bg-red-100"
          />
        </div>
      </div>

      {(file || previewUrl) && (
        <div className="relative aspect-video w-40 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
          <Image
            src={file ? URL.createObjectURL(file) : previewUrl!}
            alt=""
            fill
            className="object-cover"
            unoptimized={!!file}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
      >
        {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Agregar al menú"}
      </button>
    </form>
  );
}
