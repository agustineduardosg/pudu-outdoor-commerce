"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Session = { email: string; role: string };
type Resource = "catalog" | "inventory" | "shipping-zones" | "orders" | "media" | "variants";
type Row = Record<string, unknown> & { id: string };

const tabs: Array<{ id: Resource; label: string }> = [
  { id: "catalog", label: "Catálogo" },
  { id: "inventory", label: "Stock" },
  { id: "shipping-zones", label: "Despacho" },
  { id: "orders", label: "Pedidos" },
  { id: "media", label: "Medios" },
  { id: "variants", label: "Variantes" },
];

function text(value: unknown): string {
  if (value instanceof Date) return value.toLocaleString("es-CL");
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "—";
}

export default function AdminConsole() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Resource>("catalog");
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState("");

  const loadResource = useCallback(async (resource: Resource) => {
    const response = await fetch(`/api/admin/${resource}`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!response.ok) throw new Error("No fue posible cargar los datos.");
    const body = (await response.json()) as { data: Row[] };
    setRows(body.data);
  }, []);

  useEffect(() => {
    void fetch("/api/admin/auth/session", {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return ((await response.json()) as { data: Session }).data;
      })
      .then(async (current) => {
        setSession(current);
        if (current) await loadResource("catalog");
      })
      .finally(() => setChecking(false));
  }, [loadResource]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        totp: form.get("totp") || undefined,
      }),
    });
    if (!response.ok) {
      setMessage("No fue posible iniciar sesión. Revisa tus credenciales.");
      return;
    }
    const body = (await response.json()) as { data: Session };
    setSession(body.data);
    await loadResource("catalog");
  }

  async function logout() {
    await fetch("/api/admin/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    setSession(null);
    setRows([]);
  }

  async function mutate(payload: unknown) {
    setMessage("");
    const response = await fetch(`/api/admin/${tab}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setMessage("El cambio fue rechazado. Revisa los datos o permisos.");
      return;
    }
    setMessage("Cambio guardado y auditado.");
    await loadResource(tab);
  }

  if (checking) {
    return <main className="min-h-screen bg-[#111311] p-8 text-[#F4F1E9]">Cargando…</main>;
  }

  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#111311] px-6 text-[#F4F1E9]">
        <form
          onSubmit={login}
          className="w-full max-w-md rounded-2xl border border-white/15 bg-[#1a1e1b] p-8 shadow-2xl"
        >
          <p className="text-sm uppercase tracking-[0.28em] text-[#B8D2D2]">PUDU · Operaciones</p>
          <h1 className="mt-3 text-4xl font-semibold">Acceso privado</h1>
          <p className="mt-2 text-sm text-white/60">Sesión protegida y registrada en auditoría.</p>
          <label className="mt-8 block text-sm" htmlFor="email">Correo</label>
          <input className="mt-2 min-h-12 w-full rounded-lg border border-white/20 bg-black/20 px-4" id="email" name="email" type="email" autoComplete="username" required />
          <label className="mt-5 block text-sm" htmlFor="password">Contraseña</label>
          <input className="mt-2 min-h-12 w-full rounded-lg border border-white/20 bg-black/20 px-4" id="password" name="password" type="password" autoComplete="current-password" minLength={12} required />
          <label className="mt-5 block text-sm" htmlFor="totp">Código de 6 dígitos</label>
          <input className="mt-2 min-h-12 w-full rounded-lg border border-white/20 bg-black/20 px-4" id="totp" name="totp" inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" />
          {message ? <p className="mt-4 text-sm text-[#E99A78]" role="alert">{message}</p> : null}
          <button className="mt-8 min-h-12 w-full rounded-lg bg-[#D66A3A] px-5 font-semibold text-white hover:bg-[#e17748]" type="submit">Ingresar</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F1E9] text-[#111311]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 bg-[#111311] px-6 py-5 text-[#F4F1E9] md:px-10">
        <div><p className="text-xs tracking-[0.3em] text-[#B8D2D2]">PUDU</p><h1 className="text-2xl font-semibold">Panel operativo</h1></div>
        <div className="text-right text-sm"><p>{session.email} · {session.role}</p><button className="mt-1 underline" onClick={logout}>Cerrar sesión</button></div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <nav className="flex gap-2 overflow-x-auto" aria-label="Áreas administrativas">
          {tabs.map((item) => <button key={item.id} onClick={() => { setTab(item.id); void loadResource(item.id); }} className={`min-h-11 rounded-full px-5 text-sm ${tab === item.id ? "bg-[#24362B] text-white" : "border border-black/15"}`}>{item.label}</button>)}
        </nav>
        <div className="mt-8 flex items-end justify-between gap-4"><div><p className="text-sm uppercase tracking-[0.2em] text-[#777A74]">Gestión</p><h2 className="text-4xl font-semibold">{tabs.find((item) => item.id === tab)?.label}</h2></div><button className="min-h-11 rounded-lg border border-black/20 px-4" onClick={() => void loadResource(tab)}>Actualizar</button></div>
        {message ? <p className="mt-5 rounded-lg bg-white p-4 text-sm" role="status">{message}</p> : null}
        <ResourceForm resource={tab} mutate={mutate} reload={() => loadResource(tab)} setMessage={setMessage} />
        <section className="mt-6 overflow-x-auto rounded-xl border border-black/10 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#24362B] text-white"><tr>{columns(tab).map((column) => <th key={column.key} className="px-4 py-3 font-medium">{column.label}</th>)}<th className="px-4 py-3">Acción</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row.id} className="border-t border-black/10">{columns(tab).map((column) => <td key={column.key} className="px-4 py-3">{text(row[column.key])}</td>)}<td className="px-4 py-3"><RowAction resource={tab} row={row} mutate={mutate} /></td></tr>)}</tbody>
          </table>
          {rows.length === 0 ? <p className="p-8 text-center text-[#777A74]">No hay registros.</p> : null}
        </section>
      </div>
    </main>
  );
}

function columns(resource: Resource) {
  if (resource === "catalog") return [{ key: "name", label: "Producto" }, { key: "baseSku", label: "SKU base" }, { key: "status", label: "Estado" }, { key: "priceClp", label: "Precio CLP" }];
  if (resource === "inventory") return [{ key: "sku", label: "SKU variante" }, { key: "size", label: "Talla" }, { key: "stockOnHand", label: "Físico" }, { key: "stockReserved", label: "Reservado" }];
  if (resource === "shipping-zones") return [{ key: "code", label: "Código" }, { key: "name", label: "Zona" }, { key: "priceClp", label: "Tarifa CLP" }, { key: "freeAboveClp", label: "Gratis desde" }];
  if (resource === "media") return [{ key: "productId", label: "Producto ID" }, { key: "altText", label: "Texto alternativo" }, { key: "url", label: "URL pública" }];
  if (resource === "variants") return [{ key: "sku", label: "SKU" }, { key: "size", label: "Talla" }, { key: "colorName", label: "Color" }, { key: "active", label: "Activa" }];
  return [{ key: "id", label: "Pedido" }, { key: "email", label: "Cliente" }, { key: "status", label: "Estado" }, { key: "totalClp", label: "Total CLP" }];
}

const fieldClass = "min-h-11 rounded-lg border border-black/20 bg-white px-3";

function ResourceForm({ resource, mutate, reload, setMessage }: { resource: Resource; mutate: (payload: unknown) => Promise<void>; reload: () => Promise<void>; setMessage: (value: string) => void }) {
  if (resource === "catalog") return <form className="mt-6 grid gap-3 rounded-xl border border-black/10 bg-white p-5 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); const f = new FormData(event.currentTarget); void mutate({ id: f.get("id") || undefined, slug: f.get("slug"), baseSku: f.get("baseSku"), name: f.get("name"), subtitle: f.get("subtitle"), description: f.get("description"), priceClp: Number(f.get("priceClp")), featured: f.get("featured") === "on", status: f.get("status") }); }}>
    <h3 className="text-xl font-semibold md:col-span-3">Crear o editar producto</h3>
    <label>ID para editar (opcional)<input className={`mt-1 w-full ${fieldClass}`} name="id" /></label>
    <label>Slug<input className={`mt-1 w-full ${fieldClass}`} name="slug" required pattern="[a-z0-9-]+" /></label>
    <label>SKU base<input className={`mt-1 w-full ${fieldClass}`} name="baseSku" required /></label>
    <label>Nombre<input className={`mt-1 w-full ${fieldClass}`} name="name" required /></label>
    <label>Subtítulo<input className={`mt-1 w-full ${fieldClass}`} name="subtitle" required /></label>
    <label>Precio CLP<input className={`mt-1 w-full ${fieldClass}`} name="priceClp" type="number" min="0" required /></label>
    <label className="md:col-span-2">Descripción<textarea className={`mt-1 min-h-24 w-full ${fieldClass}`} name="description" minLength={20} required /></label>
    <label>Estado<select className={`mt-1 w-full ${fieldClass}`} name="status"><option>DRAFT</option><option>ACTIVE</option><option>ARCHIVED</option></select></label>
    <label><input name="featured" type="checkbox" /> Destacado</label><button className="min-h-11 rounded-lg bg-[#24362B] px-5 text-white" type="submit">Guardar producto</button>
  </form>;
  if (resource === "shipping-zones") return <form className="mt-6 grid gap-3 rounded-xl border border-black/10 bg-white p-5 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); const f = new FormData(event.currentTarget); void mutate({ code: f.get("code"), name: f.get("name"), communes: String(f.get("communes") || "").split(",").map((v) => v.trim()).filter(Boolean), priceClp: Number(f.get("priceClp")), freeAboveClp: Number(f.get("freeAboveClp")), active: f.get("active") === "on" }); }}>
    <h3 className="text-xl font-semibold md:col-span-3">Crear o editar zona</h3>
    <label>Código<input className={`mt-1 w-full ${fieldClass}`} name="code" required /></label><label>Nombre<input className={`mt-1 w-full ${fieldClass}`} name="name" required /></label><label>Comunas, separadas por coma<input className={`mt-1 w-full ${fieldClass}`} name="communes" /></label>
    <label>Tarifa CLP<input className={`mt-1 w-full ${fieldClass}`} name="priceClp" type="number" min="0" required /></label><label>Gratis desde<input className={`mt-1 w-full ${fieldClass}`} name="freeAboveClp" type="number" min="0" required /></label><label><input defaultChecked name="active" type="checkbox" /> Activa</label><button className="min-h-11 rounded-lg bg-[#24362B] px-5 text-white" type="submit">Guardar zona</button>
  </form>;
  if (resource === "media") return <form className="mt-6 grid gap-3 rounded-xl border border-black/10 bg-white p-5 md:grid-cols-2" onSubmit={async (event) => { event.preventDefault(); const f = new FormData(event.currentTarget); const file = f.get("file"); if (!(file instanceof File)) return; const productId = String(f.get("productId")); const presign = await fetch("/api/admin/media", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "presign", productId, fileName: file.name, contentType: file.type, size: file.size }) }); if (!presign.ok) { setMessage("No fue posible preparar la carga."); return; } const signed = (await presign.json()) as { data: { uploadUrl: string; key: string; publicUrl: string } }; const upload = await fetch(signed.data.uploadUrl, { method: "PUT", headers: { "content-type": file.type }, body: file }); if (!upload.ok) { setMessage("R2 rechazó la carga."); return; } await fetch("/api/admin/media", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "associate", productId, key: signed.data.key, url: signed.data.publicUrl, altText: f.get("altText") }) }); setMessage("Medio cargado y asociado."); await reload(); }}>
    <h3 className="text-xl font-semibold md:col-span-2">Cargar imagen a R2</h3><label>Producto ID<input className={`mt-1 w-full ${fieldClass}`} name="productId" required /></label><label>Texto alternativo<input className={`mt-1 w-full ${fieldClass}`} name="altText" required minLength={3} /></label><label>Imagen (PNG, JPEG o WebP; máximo 8 MB)<input className="mt-1 block w-full" name="file" type="file" accept="image/png,image/jpeg,image/webp" required /></label><button className="min-h-11 rounded-lg bg-[#24362B] px-5 text-white" type="submit">Subir y asociar</button>
  </form>;
  if (resource === "variants") return <form className="mt-6 grid gap-3 rounded-xl border border-black/10 bg-white p-5 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); const f = new FormData(event.currentTarget); void mutate({ id: f.get("id") || undefined, productId: f.get("productId"), sku: f.get("sku"), size: f.get("size"), colorName: f.get("colorName"), colorHex: f.get("colorHex"), stockOnHand: Number(f.get("stockOnHand")), active: f.get("active") === "on" }); }}>
    <h3 className="text-xl font-semibold md:col-span-3">Crear o editar variante</h3><label>ID para editar (opcional)<input className={`mt-1 w-full ${fieldClass}`} name="id" /></label><label>Producto ID<input className={`mt-1 w-full ${fieldClass}`} name="productId" required /></label><label>SKU completo<input className={`mt-1 w-full ${fieldClass}`} name="sku" required /></label><label>Talla<input className={`mt-1 w-full ${fieldClass}`} name="size" required /></label><label>Color<input className={`mt-1 w-full ${fieldClass}`} name="colorName" required /></label><label>Color hexadecimal<input className={`mt-1 w-full ${fieldClass}`} name="colorHex" defaultValue="#111311" pattern="#[0-9A-Fa-f]{6}" required /></label><label>Stock físico<input className={`mt-1 w-full ${fieldClass}`} name="stockOnHand" type="number" min="0" required /></label><label><input defaultChecked name="active" type="checkbox" /> Activa</label><button className="min-h-11 rounded-lg bg-[#24362B] px-5 text-white" type="submit">Guardar variante</button>
  </form>;
  return null;
}

function RowAction({ resource, row, mutate }: { resource: Resource; row: Row; mutate: (payload: unknown) => Promise<void> }) {
  if (resource === "inventory") return <button className="underline" onClick={() => { const value = window.prompt("Nuevo stock físico", text(row.stockOnHand)); if (value && /^\d+$/.test(value)) void mutate({ sku: row.sku, stockOnHand: Number(value) }); }}>Editar stock</button>;
  if (resource === "orders") return <button className="underline" onClick={() => { const value = window.prompt("Nuevo estado: PREPARING, SHIPPED, COMPLETED, CANCELLED o REVIEW"); if (value) void mutate({ orderId: row.id, status: value.toUpperCase() }); }}>Cambiar estado</button>;
  return <span className="text-[#777A74]">Solo vista</span>;
}
