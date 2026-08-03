"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";

type Session = { email: string; role: "OWNER" | "MANAGER" | "FULFILLMENT" };
type Resource =
  | "dashboard"
  | "influencers"
  | "influencer-media"
  | "catalog"
  | "variants"
  | "inventory"
  | "media"
  | "orders"
  | "shipping-zones"
  | "audit";
type Row = Record<string, unknown> & { id: string };
type Dashboard = {
  products: number;
  activeProducts: number;
  influencers: number;
  activeInfluencers: number;
  orders: number;
  openOrders: number;
  lowStock: number;
  media: number;
};

const navigation: Array<{ label: string; items: Array<{ id: Resource; label: string }> }> = [
  { label: "Control", items: [{ id: "dashboard", label: "Resumen" }] },
  {
    label: "Marca",
    items: [
      { id: "influencers", label: "Embajadores" },
      { id: "influencer-media", label: "Archivo fotográfico" },
    ],
  },
  {
    label: "Comercio",
    items: [
      { id: "catalog", label: "Productos" },
      { id: "variants", label: "Variantes" },
      { id: "inventory", label: "Inventario" },
      { id: "media", label: "Fotos de producto" },
      { id: "orders", label: "Pedidos" },
      { id: "shipping-zones", label: "Despacho" },
    ],
  },
  { label: "Sistema", items: [{ id: "audit", label: "Auditoría" }] },
];

const resourceTitle: Record<Resource, { eyebrow: string; title: string; description: string }> = {
  dashboard: { eyebrow: "Centro de control", title: "Estado de operación", description: "Una lectura rápida del catálogo, la marca y los pedidos." },
  influencers: { eyebrow: "Identidad de marca", title: "Embajadores", description: "Perfiles editoriales, estado de publicación e información de contacto." },
  "influencer-media": { eyebrow: "Biblioteca visual", title: "Archivo fotográfico", description: "Retratos, campañas y escenas de producto organizadas por embajador." },
  catalog: { eyebrow: "Comercio", title: "Productos", description: "Información comercial, precio, publicación y posición editorial." },
  variants: { eyebrow: "Comercio", title: "Variantes", description: "SKU, talla, color y disponibilidad por producto." },
  inventory: { eyebrow: "Operaciones", title: "Inventario", description: "Stock físico, reservas y unidades disponibles para venta." },
  media: { eyebrow: "Biblioteca visual", title: "Fotos de producto", description: "Imágenes asociadas al catálogo y sus textos alternativos." },
  orders: { eyebrow: "Operaciones", title: "Pedidos", description: "Seguimiento de preparación, despacho y casos en revisión." },
  "shipping-zones": { eyebrow: "Logística", title: "Zonas de despacho", description: "Tarifas, comunas y umbrales de envío gratuito." },
  audit: { eyebrow: "Gobernanza", title: "Registro de actividad", description: "Trazabilidad de cambios realizados en el panel." },
};

const inputClass = "min-h-11 w-full border border-[#c8c5bc] bg-white px-3 text-sm outline-none focus:border-[#24362b] focus:ring-2 focus:ring-[#b8d2d2]";
const primaryButton = "min-h-11 bg-[#24362b] px-5 text-sm font-bold text-white hover:bg-[#17251d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d66a3a] disabled:opacity-50";
const secondaryButton = "min-h-11 border border-[#aaa89f] bg-transparent px-4 text-sm font-semibold hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24362b]";

function display(value: unknown): string {
  if (value === true) return "Sí";
  if (value === false) return "No";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "—";
}

function currency(value: unknown) {
  return typeof value === "number"
    ? new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value)
    : "—";
}

async function problemMessage(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { detail?: string; title?: string };
    return body.detail || body.title || fallback;
  } catch {
    return fallback;
  }
}

export default function AdminConsole() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [resource, setResource] = useState<Resource>("dashboard");
  const [rows, setRows] = useState<Row[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [influencers, setInfluencers] = useState<Row[]>([]);
  const [products, setProducts] = useState<Row[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadResource = useCallback(async (next: Resource) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/${next}`, { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) throw new Error(await problemMessage(response, "No fue posible cargar los datos."));
      const body = (await response.json()) as { data: Row[] | Dashboard };
      if (next === "dashboard") {
        setDashboard(body.data as Dashboard);
        setRows([]);
      } else {
        const data = body.data as Row[];
        setRows(data);
        if (next === "influencers") setInfluencers(data);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible cargar los datos.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshInfluencers = useCallback(async () => {
    const response = await fetch("/api/admin/influencers", { credentials: "same-origin", cache: "no-store" });
    if (!response.ok) return;
    const body = (await response.json()) as { data: Row[] };
    setInfluencers(body.data);
  }, []);

  const refreshProducts = useCallback(async () => {
    const response = await fetch("/api/admin/catalog", { credentials: "same-origin", cache: "no-store" });
    if (!response.ok) return;
    const body = (await response.json()) as { data: Row[] };
    setProducts(body.data);
  }, []);

  useEffect(() => {
    void fetch("/api/admin/auth/session", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => response.ok ? ((await response.json()) as { data: Session }).data : null)
      .then(async (current) => {
        setSession(current);
        if (current) await Promise.all([loadResource("dashboard"), refreshInfluencers(), refreshProducts()]);
      })
      .finally(() => setChecking(false));
  }, [loadResource, refreshInfluencers, refreshProducts]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password"), totp: form.get("totp") || undefined }),
    });
    if (!response.ok) {
      setError("Acceso rechazado. Revisa las credenciales y el código de seguridad.");
      return;
    }
    const body = (await response.json()) as { data: Session };
    setSession(body.data);
    await Promise.all([loadResource("dashboard"), refreshInfluencers(), refreshProducts()]);
  }

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "same-origin" });
    setSession(null);
    setRows([]);
    setDashboard(null);
  }

  async function mutate(target: Resource, payload: unknown) {
    setError("");
    setMessage("");
    const response = await fetch(`/api/admin/${target}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setError(await problemMessage(response, "El cambio fue rechazado. Revisa los datos y permisos."));
      return false;
    }
    setMessage("Cambio guardado y registrado en auditoría.");
    await Promise.all([loadResource("dashboard"), refreshInfluencers(), refreshProducts()]);
    if (resource !== "dashboard") await loadResource(resource);
    return true;
  }

  async function remove(target: Resource, id: string) {
    if (!window.confirm(target.includes("media") ? "¿Eliminar esta fotografía?" : "¿Archivar este registro?")) return;
    const response = await fetch(`/api/admin/${target}?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (!response.ok) {
      setError(await problemMessage(response, "No fue posible completar la acción."));
      return;
    }
    setMessage(target.includes("media") ? "Fotografía eliminada." : "Registro archivado.");
    await Promise.all([loadResource(resource), refreshInfluencers()]);
  }

  function selectResource(next: Resource) {
    setResource(next);
    setMessage("");
    setError("");
    void loadResource(next);
  }

  if (checking) return <main className="grid min-h-screen place-items-center bg-[#111311] text-[#f4f1e9]">Preparando operaciones…</main>;
  if (!session) return <LoginScreen onSubmit={login} error={error} />;

  const heading = resourceTitle[resource];
  return (
    <main className="min-h-screen bg-[#ece9e1] text-[#111311] lg:grid lg:grid-cols-[270px_1fr]">
      <aside className="border-b border-white/10 bg-[#111311] text-[#f4f1e9] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex min-h-24 items-center justify-between border-b border-white/10 px-6">
          <div><p className="text-[10px] font-bold tracking-[0.32em] text-[#b8d2d2]">PUDU</p><p className="mt-1 font-semibold">Field Operations</p></div>
          <span className="grid size-10 place-items-center border border-white/20 text-xs text-[#d66a3a]">CL</span>
        </div>
        <nav className="flex gap-2 overflow-x-auto p-4 lg:block lg:h-[calc(100vh-190px)] lg:overflow-y-auto" aria-label="Administración">
          {navigation.map((group) => (
            <div className="shrink-0 lg:mb-7" key={group.label}>
              <p className="mb-2 hidden px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-white/38 lg:block">{group.label}</p>
              <div className="flex gap-1 lg:block">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    className={`min-h-11 whitespace-nowrap border-l-2 px-3 text-left text-sm lg:block lg:w-full ${resource === item.id ? "border-[#d66a3a] bg-white/8 text-white" : "border-transparent text-white/62 hover:bg-white/5 hover:text-white"}`}
                    onClick={() => selectResource(item.id)}
                    type="button"
                  >{item.label}</button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="hidden border-t border-white/10 p-5 text-xs text-white/55 lg:block">
          <p className="truncate text-white/80">{session.email}</p>
          <p className="mt-1">{session.role}</p>
          <button className="mt-4 min-h-11 text-[#b8d2d2] underline underline-offset-4" onClick={logout}>Cerrar sesión</button>
        </div>
      </aside>

      <section className="min-w-0">
        <header className="border-b border-[#cbc8bf] bg-[#f4f1e9] px-5 py-7 md:px-8 lg:px-12">
          <div className="mx-auto flex max-w-[1500px] items-end justify-between gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#777a74]">{heading.eyebrow}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">{heading.title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-[#5d605b]">{heading.description}</p>
            </div>
            <button className={`${secondaryButton} hidden md:block`} onClick={() => void loadResource(resource)} disabled={loading}>Actualizar</button>
          </div>
        </header>
        <div className="mx-auto max-w-[1500px] p-5 md:p-8 lg:p-12">
          {error ? <p className="mb-6 border-l-4 border-[#b74232] bg-white p-4 text-sm" role="alert">{error}</p> : null}
          {message ? <p className="mb-6 border-l-4 border-[#3e6b4b] bg-white p-4 text-sm" role="status">{message}</p> : null}
          {loading ? <p className="mb-5 text-sm text-[#777a74]">Actualizando información…</p> : null}
          <ResourceView
            resource={resource}
            rows={rows}
            dashboard={dashboard}
            influencers={influencers}
            products={products}
            role={session.role}
            mutate={mutate}
            remove={remove}
            reload={() => loadResource(resource)}
            setError={setError}
            setMessage={setMessage}
          />
        </div>
      </section>
    </main>
  );
}

function LoginScreen({ onSubmit, error }: { onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>; error: string }) {
  return (
    <main className="grid min-h-screen bg-[#111311] text-[#f4f1e9] lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative hidden overflow-hidden border-r border-white/10 p-14 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-20 [background-image:repeating-radial-gradient(ellipse_at_20%_80%,transparent_0,transparent_28px,#b8d2d2_29px,transparent_30px)]" />
        <p className="relative text-xs font-bold tracking-[0.3em] text-[#b8d2d2]">PUDU · OPERACIONES</p>
        <div className="relative max-w-xl">
          <p className="text-sm uppercase tracking-[0.2em] text-[#d66a3a]">Backoffice privado</p>
          <h1 className="mt-5 text-7xl font-semibold leading-[0.88] tracking-[-0.06em]">La marca también se construye detrás de escena.</h1>
        </div>
        <p className="relative text-xs text-white/45">CATÁLOGO · ARCHIVO · INVENTARIO · PEDIDOS</p>
      </section>
      <section className="grid place-items-center px-6 py-12">
        <form className="w-full max-w-md" onSubmit={onSubmit}>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#b8d2d2]">Acceso autorizado</p>
          <h2 aria-label="Acceso privado" className="mt-3 text-4xl font-semibold">Panel administrativo</h2>
          <p className="mt-3 text-sm text-white/55">Sesión protegida, limitada por rol y registrada en auditoría.</p>
          <label className="mt-8 block text-sm" htmlFor="email">Correo</label>
          <input className={`${inputClass} mt-2 border-white/20 bg-white/5 text-white focus:border-[#b8d2d2]`} id="email" name="email" type="email" autoComplete="username" required />
          <label className="mt-5 block text-sm" htmlFor="password">Contraseña</label>
          <input className={`${inputClass} mt-2 border-white/20 bg-white/5 text-white focus:border-[#b8d2d2]`} id="password" name="password" type="password" autoComplete="current-password" minLength={12} required />
          <label className="mt-5 block text-sm" htmlFor="totp">Código de seguridad</label>
          <input className={`${inputClass} mt-2 border-white/20 bg-white/5 text-white focus:border-[#b8d2d2]`} id="totp" name="totp" inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" placeholder="6 dígitos" />
          {error ? <p className="mt-4 border-l-2 border-[#d66a3a] pl-3 text-sm text-[#f0a687]" role="alert">{error}</p> : null}
          <button className="mt-8 min-h-12 w-full bg-[#d66a3a] px-5 font-bold text-white hover:bg-[#e17748] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b8d2d2]" type="submit">Ingresar de forma segura</button>
        </form>
      </section>
    </main>
  );
}

function ResourceView(props: {
  resource: Resource;
  rows: Row[];
  dashboard: Dashboard | null;
  influencers: Row[];
  products: Row[];
  role: Session["role"];
  mutate: (resource: Resource, payload: unknown) => Promise<boolean>;
  remove: (resource: Resource, id: string) => Promise<void>;
  reload: () => Promise<void>;
  setError: (value: string) => void;
  setMessage: (value: string) => void;
}) {
  if (props.resource === "dashboard") return <DashboardView data={props.dashboard} />;
  if (props.resource === "influencers") return <InfluencersView {...props} />;
  if (props.resource === "influencer-media") return <MediaView {...props} influencerMode />;
  if (props.resource === "media") return <MediaView {...props} influencerMode={false} />;
  if (props.resource === "catalog") return <ProductsView {...props} />;
  if (props.resource === "inventory") return <InventoryView {...props} />;
  if (props.resource === "variants") return <VariantsView {...props} />;
  if (props.resource === "shipping-zones") return <ShippingView {...props} />;
  return <LedgerTable resource={props.resource} rows={props.rows} mutate={props.mutate} />;
}

function DashboardView({ data }: { data: Dashboard | null }) {
  if (!data) return <EmptyState text="No hay métricas disponibles." />;
  const cards = [
    ["Productos activos", data.activeProducts, `${data.products} registros totales`],
    ["Embajadores activos", data.activeInfluencers, `${data.influencers} perfiles`],
    ["Pedidos abiertos", data.openOrders, `${data.orders} pedidos históricos`],
    ["Stock crítico", data.lowStock, "Variantes con 5 unidades o menos"],
  ];
  return (
    <div className="space-y-8">
      <section className="grid border-l border-t border-[#c8c5bc] sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, note]) => (
          <article className="min-h-48 border-b border-r border-[#c8c5bc] bg-[#f4f1e9] p-6" key={String(label)}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#777a74]">{label}</p>
            <p className="mt-7 text-6xl font-semibold tracking-[-0.06em]">{value}</p>
            <p className="mt-4 text-xs text-[#6a6d67]">{note}</p>
          </article>
        ))}
      </section>
      <section className="grid gap-0 border border-[#c8c5bc] bg-[#24362b] text-white md:grid-cols-[1fr_320px]">
        <div className="p-8 md:p-12"><p className="text-xs font-bold tracking-[0.18em] text-[#b8d2d2]">HOY EN PUDU</p><h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Un catálogo consistente comienza con un archivo ordenado.</h2></div>
        <div className="border-t border-white/15 p-8 md:border-l md:border-t-0"><p className="text-sm text-white/65">Archivo visual</p><p className="mt-3 text-5xl font-semibold">{data.media}</p><p className="mt-2 text-xs text-white/55">Fotografías de embajadores registradas</p></div>
      </section>
    </div>
  );
}

function InfluencersView({ rows, mutate, remove }: { rows: Row[]; mutate: (resource: Resource, payload: unknown) => Promise<boolean>; remove: (resource: Resource, id: string) => Promise<void> }) {
  const [editing, setEditing] = useState<Row | null>(null);
  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(360px,0.75fr)_minmax(0,1.25fr)]">
      <InfluencerForm key={editing?.id ?? "new"} value={editing} onCancel={() => setEditing(null)} onSave={async (payload) => { const ok = await mutate("influencers", payload); if (ok) setEditing(null); }} />
      <section className="grid content-start gap-4 sm:grid-cols-2">
        {rows.map((row) => {
          const media = Array.isArray(row.media) ? row.media[0] as { url?: string; altText?: string } | undefined : undefined;
          const count = typeof row._count === "object" && row._count ? Number((row._count as { media?: number }).media ?? 0) : 0;
          return (
            <article className="border border-[#c8c5bc] bg-[#f4f1e9]" key={row.id}>
              <div className="relative aspect-[4/3] overflow-hidden bg-[#d8d4ca]">{media?.url ? <Image className="object-cover" src={media.url} alt={media.altText || ""} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" unoptimized /> : <div className="grid h-full place-items-center text-xs text-[#777a74]">Sin retrato</div>}</div>
              <div className="p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="text-2xl font-semibold">{display(row.displayName)}</h3><p className="mt-1 text-xs text-[#6b6e68]">@{display(row.instagramHandle)} · {display(row.location)}</p></div><Status value={display(row.status)} /></div>
                <p className="mt-4 line-clamp-3 text-sm text-[#555853]">{display(row.bio)}</p><p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[#777a74]">{count} fotografías</p>
                <div className="mt-5 flex gap-2"><button className={secondaryButton} onClick={() => setEditing(row)}>Editar</button><button className="min-h-11 px-3 text-sm text-[#8f3026] underline" onClick={() => void remove("influencers", row.id)}>Archivar</button></div>
              </div>
            </article>
          );
        })}
        {rows.length === 0 ? <EmptyState text="Crea el primer perfil de embajador." /> : null}
      </section>
    </div>
  );
}

function InfluencerForm({ value, onSave, onCancel }: { value: Row | null; onSave: (payload: unknown) => Promise<void>; onCancel: () => void }) {
  return (
    <form className="h-fit border-t-4 border-[#d66a3a] bg-white p-6 xl:sticky xl:top-8" onSubmit={(event) => { event.preventDefault(); const f = new FormData(event.currentTarget); void onSave({ id: value?.id, slug: f.get("slug"), displayName: f.get("displayName"), legalName: f.get("legalName") || null, pronouns: f.get("pronouns") || null, bio: f.get("bio"), location: f.get("location") || null, email: f.get("email") || null, instagramHandle: f.get("instagramHandle") || null, status: f.get("status"), featured: f.get("featured") === "on", sortOrder: Number(f.get("sortOrder")) }); }}>
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#777a74]">{value ? "Editar perfil" : "Nuevo perfil"}</p><h2 className="mt-2 text-3xl font-semibold">Ficha de embajador</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Nombre público"><input className={inputClass} name="displayName" defaultValue={display(value?.displayName)} required /></Field>
        <Field label="Slug"><input className={inputClass} name="slug" defaultValue={display(value?.slug)} pattern="[a-z0-9-]+" required /></Field>
        <Field label="Nombre legal"><input className={inputClass} name="legalName" defaultValue={display(value?.legalName) === "—" ? "" : display(value?.legalName)} /></Field>
        <Field label="Pronombres"><input className={inputClass} name="pronouns" defaultValue={display(value?.pronouns) === "—" ? "" : display(value?.pronouns)} /></Field>
        <Field label="Ubicación"><input className={inputClass} name="location" defaultValue={display(value?.location) === "—" ? "" : display(value?.location)} /></Field>
        <Field label="Instagram"><input className={inputClass} name="instagramHandle" defaultValue={display(value?.instagramHandle) === "—" ? "" : display(value?.instagramHandle)} placeholder="usuario" /></Field>
        <Field label="Correo privado"><input className={inputClass} name="email" type="email" defaultValue={display(value?.email) === "—" ? "" : display(value?.email)} /></Field>
        <Field label="Orden"><input className={inputClass} name="sortOrder" type="number" min="0" defaultValue={Number(value?.sortOrder ?? 0)} /></Field>
        <Field label="Estado"><select className={inputClass} name="status" defaultValue={display(value?.status) === "—" ? "DRAFT" : display(value?.status)}><option value="DRAFT">Borrador</option><option value="ACTIVE">Activo</option><option value="INACTIVE">Inactivo</option><option value="ARCHIVED">Archivado</option></select></Field>
        <label className="flex min-h-11 items-center gap-3 self-end"><input defaultChecked={Boolean(value?.featured)} name="featured" type="checkbox" /> Destacar en campañas</label>
        <Field label="Biografía" wide><textarea className={`${inputClass} min-h-32 py-3`} name="bio" defaultValue={display(value?.bio) === "—" ? "" : display(value?.bio)} minLength={20} required /></Field>
      </div>
      <div className="mt-6 flex flex-wrap gap-3"><button className={primaryButton} type="submit">Guardar perfil</button>{value ? <button className={secondaryButton} type="button" onClick={onCancel}>Cancelar edición</button> : null}</div>
    </form>
  );
}

function ProductsView({ rows, mutate, remove }: { rows: Row[]; mutate: (resource: Resource, payload: unknown) => Promise<boolean>; remove: (resource: Resource, id: string) => Promise<void> }) {
  const [editing, setEditing] = useState<Row | null>(null);
  return <div className="space-y-8"><ProductForm key={editing?.id ?? "new"} value={editing} onSave={async (payload) => { const ok = await mutate("catalog", payload); if (ok) setEditing(null); }} onCancel={() => setEditing(null)} /><DataTable columns={[{ key: "name", label: "Producto" }, { key: "baseSku", label: "SKU base" }, { key: "status", label: "Estado" }, { key: "priceClp", label: "Precio", money: true }]} rows={rows} actions={(row) => <><button className="underline" onClick={() => setEditing(row)}>Editar</button><button className="text-[#8f3026] underline" onClick={() => void remove("catalog", row.id)}>Archivar</button></>} /></div>;
}

function ProductForm({ value, onSave, onCancel }: { value: Row | null; onSave: (payload: unknown) => Promise<void>; onCancel: () => void }) {
  return <form className="grid gap-4 border-t-4 border-[#24362b] bg-white p-6 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); const f = new FormData(event.currentTarget); void onSave({ id: value?.id, slug: f.get("slug"), baseSku: f.get("baseSku"), name: f.get("name"), subtitle: f.get("subtitle"), description: f.get("description"), priceClp: Number(f.get("priceClp")), featured: f.get("featured") === "on", status: f.get("status") }); }}>
    <div className="md:col-span-3"><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#777a74]">{value ? "Editar producto" : "Nuevo producto"}</p><h2 className="mt-2 text-3xl font-semibold">Ficha comercial</h2></div>
    <Field label="Nombre"><input className={inputClass} name="name" defaultValue={display(value?.name) === "—" ? "" : display(value?.name)} required /></Field><Field label="Slug"><input className={inputClass} name="slug" defaultValue={display(value?.slug) === "—" ? "" : display(value?.slug)} pattern="[a-z0-9-]+" required /></Field><Field label="SKU base"><input className={inputClass} name="baseSku" defaultValue={display(value?.baseSku) === "—" ? "" : display(value?.baseSku)} required /></Field>
    <Field label="Subtítulo"><input className={inputClass} name="subtitle" defaultValue={display(value?.subtitle) === "—" ? "" : display(value?.subtitle)} required /></Field><Field label="Precio CLP"><input className={inputClass} name="priceClp" type="number" min="0" defaultValue={Number(value?.priceClp ?? 0)} required /></Field><Field label="Estado"><select className={inputClass} name="status" defaultValue={display(value?.status) === "—" ? "DRAFT" : display(value?.status)}><option value="DRAFT">Borrador</option><option value="ACTIVE">Activo</option><option value="ARCHIVED">Archivado</option></select></Field>
    <Field label="Descripción" wide><textarea className={`${inputClass} min-h-28 py-3`} name="description" defaultValue={display(value?.description) === "—" ? "" : display(value?.description)} minLength={20} required /></Field><label className="flex min-h-11 items-center gap-3"><input name="featured" type="checkbox" defaultChecked={Boolean(value?.featured)} /> Producto destacado</label>
    <div className="flex gap-3 md:col-span-3"><button className={primaryButton} type="submit">Guardar producto</button>{value ? <button className={secondaryButton} type="button" onClick={onCancel}>Cancelar</button> : null}</div>
  </form>;
}

function MediaView({ rows, influencers, products, influencerMode, setError, setMessage, reload, remove }: { rows: Row[]; influencers: Row[]; products: Row[]; influencerMode: boolean; setError: (value: string) => void; setMessage: (value: string) => void; reload: () => Promise<void>; remove: (resource: Resource, id: string) => Promise<void> }) {
  const targetResource: Resource = influencerMode ? "influencer-media" : "media";
  const [uploading, setUploading] = useState(false);
  return <div className="space-y-8"><form className="grid gap-4 border-t-4 border-[#d66a3a] bg-white p-6 md:grid-cols-3" onSubmit={async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const f = new FormData(form);
    const file = f.get("file");
    setError("");
    setMessage("");
    if (!(file instanceof File) || file.size === 0) { setError("Selecciona una imagen antes de continuar."); return; }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) { setError("La imagen debe ser JPG, PNG o WebP."); return; }
    if (file.size > 8 * 1024 * 1024) { setError("La imagen no puede superar 8 MB."); return; }
    const idField = influencerMode ? "influencerId" : "productId";
    const targetId = String(f.get(idField));
    if (!targetId) { setError(influencerMode ? "Selecciona un embajador." : "Selecciona un producto."); return; }
    setUploading(true);
    try {
      const presignPayload = { action: "presign", [idField]: targetId, fileName: file.name, contentType: file.type, size: file.size };
      const presign = await fetch(`/api/admin/${targetResource}`, { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(presignPayload) });
      if (!presign.ok) { setError(await problemMessage(presign, "No fue posible preparar la carga. Revisa la configuración de R2.")); return; }
      const signed = (await presign.json()) as { data: { uploadUrl: string; key: string; publicUrl: string } };
      const upload = await fetch(signed.data.uploadUrl, { method: "PUT", headers: { "content-type": file.type }, body: file });
      if (!upload.ok) { setError(`El almacenamiento rechazó la imagen (HTTP ${upload.status}).`); return; }
      const associatePayload = influencerMode ? { action: "associate", influencerId: targetId, key: signed.data.key, url: signed.data.publicUrl, altText: f.get("altText"), caption: f.get("caption") || null, kind: f.get("kind"), sortOrder: Number(f.get("sortOrder")) } : { action: "associate", productId: targetId, key: signed.data.key, url: signed.data.publicUrl, altText: f.get("altText") };
      const associate = await fetch(`/api/admin/${targetResource}`, { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(associatePayload) });
      if (!associate.ok) { setError(await problemMessage(associate, "La imagen se cargó, pero no fue posible registrarla.")); return; }
      setMessage("Fotografía cargada y registrada."); form.reset(); await reload();
    } catch {
      setError("No fue posible conectar con el almacenamiento. Revisa CORS y vuelve a intentarlo.");
    } finally {
      setUploading(false);
    }
  }}>
    <div className="md:col-span-3"><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#777a74]">Nueva imagen</p><h2 className="mt-2 text-3xl font-semibold">Carga segura a la biblioteca</h2></div>
    {influencerMode ? <Field label="Embajador"><select className={inputClass} name="influencerId" required><option value="">Seleccionar perfil</option>{influencers.map((item) => <option key={item.id} value={item.id}>{display(item.displayName)}</option>)}</select></Field> : <Field label="Producto"><select className={inputClass} name="productId" required><option value="">Seleccionar producto</option>{products.map((item) => <option key={item.id} value={item.id}>{display(item.name)}</option>)}</select></Field>}
    <Field label="Texto alternativo"><input className={inputClass} name="altText" minLength={3} required /></Field><Field label="Imagen"><input className={`${inputClass} py-2`} name="file" type="file" accept="image/png,image/jpeg,image/webp" required /></Field>
    {influencerMode ? <><Field label="Tipo"><select className={inputClass} name="kind"><option value="PORTRAIT">Retrato</option><option value="LIFESTYLE">Lifestyle</option><option value="CAMPAIGN">Campaña</option><option value="PRODUCT">Producto</option></select></Field><Field label="Orden"><input className={inputClass} name="sortOrder" type="number" min="0" defaultValue="0" /></Field><Field label="Pie de foto"><input className={inputClass} name="caption" /></Field></> : null}
    <button className={`${primaryButton} md:col-span-3 md:w-fit disabled:cursor-wait disabled:opacity-60`} type="submit" disabled={uploading}>{uploading ? "Subiendo fotografía…" : "Subir fotografía"}</button>
  </form><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{rows.map((row) => <article className="border border-[#c8c5bc] bg-[#f4f1e9]" key={row.id}><div className="relative aspect-[4/3] bg-[#d8d4ca]"><Image className="object-cover" src={display(row.url)} alt={display(row.altText)} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" unoptimized /></div><div className="p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#777a74]">{influencerMode ? display(row.kind) : "Producto"}</p><p className="mt-2 text-sm">{display(row.altText)}</p><p className="mt-1 text-xs text-[#777a74]">{influencerMode ? display((row.influencer as { displayName?: unknown } | undefined)?.displayName) : display((row.product as { name?: unknown } | undefined)?.name)}</p><button className="mt-4 min-h-11 text-sm text-[#8f3026] underline" onClick={() => void remove(targetResource, row.id)}>Eliminar fotografía</button></div></article>)}{rows.length === 0 ? <EmptyState text="Aún no hay fotografías en esta biblioteca." /> : null}</section></div>;
}

function InventoryView({ rows, mutate }: { rows: Row[]; mutate: (resource: Resource, payload: unknown) => Promise<boolean> }) {
  return <DataTable columns={[{ key: "sku", label: "SKU" }, { key: "size", label: "Talla" }, { key: "colorName", label: "Color" }, { key: "stockOnHand", label: "Físico" }, { key: "stockReserved", label: "Reservado" }, { key: "available", label: "Disponible", derive: (row) => Number(row.stockOnHand ?? 0) - Number(row.stockReserved ?? 0) }]} rows={rows} actions={(row) => <StockEditor row={row} mutate={mutate} />} />;
}

function StockEditor({ row, mutate }: { row: Row; mutate: (resource: Resource, payload: unknown) => Promise<boolean> }) {
  const [value, setValue] = useState(Number(row.stockOnHand ?? 0));
  return <div className="flex items-center gap-2"><input aria-label={`Stock ${display(row.sku)}`} className="h-10 w-20 border border-[#aaa89f] bg-white px-2" min={Number(row.stockReserved ?? 0)} type="number" value={value} onChange={(event) => setValue(Number(event.target.value))} /><button className="min-h-10 px-2 text-sm underline" onClick={() => void mutate("inventory", { sku: row.sku, stockOnHand: value })}>Guardar</button></div>;
}

function VariantsView({ rows, products, mutate }: { rows: Row[]; products: Row[]; mutate: (resource: Resource, payload: unknown) => Promise<boolean> }) {
  return <div className="space-y-6"><VariantForm products={products} mutate={mutate} /><DataTable columns={[{ key: "sku", label: "SKU" }, { key: "size", label: "Talla" }, { key: "colorName", label: "Color" }, { key: "stockOnHand", label: "Stock" }, { key: "active", label: "Activa" }]} rows={rows} /></div>;
}

function VariantForm({ products, mutate }: { products: Row[]; mutate: (resource: Resource, payload: unknown) => Promise<boolean> }) {
  return <form className="grid gap-4 border-t-4 border-[#24362b] bg-white p-6 md:grid-cols-4" onSubmit={(event) => { event.preventDefault(); const f = new FormData(event.currentTarget); void mutate("variants", { productId: f.get("productId"), sku: f.get("sku"), size: f.get("size"), colorName: f.get("colorName"), colorHex: f.get("colorHex"), active: f.get("active") === "on", stockOnHand: Number(f.get("stockOnHand")) }); }}><h2 className="text-2xl font-semibold md:col-span-4">Nueva variante</h2><Field label="Producto"><select className={inputClass} name="productId" required><option value="">Seleccionar producto</option>{products.map((item) => <option key={item.id} value={item.id}>{display(item.name)}</option>)}</select></Field><Field label="SKU"><input className={inputClass} name="sku" required /></Field><Field label="Talla"><input className={inputClass} name="size" required /></Field><Field label="Color"><input className={inputClass} name="colorName" required /></Field><Field label="Color HEX"><input className={inputClass} name="colorHex" defaultValue="#111311" pattern="#[0-9A-Fa-f]{6}" required /></Field><Field label="Stock"><input className={inputClass} name="stockOnHand" type="number" min="0" defaultValue="0" required /></Field><label className="flex min-h-11 items-center gap-3"><input name="active" type="checkbox" defaultChecked /> Activa</label><button className={primaryButton}>Guardar variante</button></form>;
}

function ShippingView({ rows, mutate }: { rows: Row[]; mutate: (resource: Resource, payload: unknown) => Promise<boolean> }) {
  return <div className="space-y-6"><form className="grid gap-4 border-t-4 border-[#24362b] bg-white p-6 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); const f = new FormData(event.currentTarget); void mutate("shipping-zones", { code: f.get("code"), name: f.get("name"), communes: String(f.get("communes") || "").split(",").map((value) => value.trim()).filter(Boolean), priceClp: Number(f.get("priceClp")), freeAboveClp: Number(f.get("freeAboveClp")), active: f.get("active") === "on" }); }}><h2 className="text-2xl font-semibold md:col-span-3">Crear o actualizar zona</h2><Field label="Código"><input className={inputClass} name="code" required /></Field><Field label="Nombre"><input className={inputClass} name="name" required /></Field><Field label="Comunas separadas por coma"><input className={inputClass} name="communes" /></Field><Field label="Tarifa CLP"><input className={inputClass} name="priceClp" type="number" min="0" required /></Field><Field label="Gratis desde"><input className={inputClass} name="freeAboveClp" type="number" min="0" required /></Field><label className="flex min-h-11 items-center gap-3"><input name="active" type="checkbox" defaultChecked /> Activa</label><button className={primaryButton}>Guardar zona</button></form><DataTable columns={[{ key: "code", label: "Código" }, { key: "name", label: "Zona" }, { key: "priceClp", label: "Tarifa", money: true }, { key: "freeAboveClp", label: "Gratis desde", money: true }, { key: "active", label: "Activa" }]} rows={rows} /></div>;
}

function LedgerTable({ resource, rows, mutate }: { resource: Resource; rows: Row[]; mutate: (resource: Resource, payload: unknown) => Promise<boolean> }) {
  if (resource === "orders") return <DataTable columns={[{ key: "id", label: "Pedido" }, { key: "email", label: "Cliente" }, { key: "status", label: "Estado" }, { key: "totalClp", label: "Total", money: true }, { key: "createdAt", label: "Fecha" }]} rows={rows} actions={(row) => <OrderEditor row={row} mutate={mutate} />} />;
  return <DataTable columns={[{ key: "createdAt", label: "Fecha" }, { key: "actor", label: "Actor" }, { key: "action", label: "Acción" }, { key: "targetType", label: "Recurso" }, { key: "targetId", label: "ID" }]} rows={rows} />;
}

function OrderEditor({ row, mutate }: { row: Row; mutate: (resource: Resource, payload: unknown) => Promise<boolean> }) {
  const [status, setStatus] = useState("PREPARING");
  return <div className="flex gap-2"><select className="h-10 border border-[#aaa89f] bg-white px-2" value={status} onChange={(event) => setStatus(event.target.value)}><option>PREPARING</option><option>SHIPPED</option><option>COMPLETED</option><option>CANCELLED</option><option>REVIEW</option></select><button className="underline" onClick={() => void mutate("orders", { orderId: row.id, status })}>Aplicar</button></div>;
}

function DataTable({ columns, rows, actions }: { columns: Array<{ key: string; label: string; money?: boolean; derive?: (row: Row) => unknown }>; rows: Row[]; actions?: (row: Row) => ReactNode }) {
  return <section className="overflow-x-auto border border-[#c8c5bc] bg-[#f4f1e9]"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-[#c8c5bc] bg-[#24362b] text-white">{columns.map((column) => <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.1em]" key={column.key}>{column.label}</th>)}{actions ? <th className="px-4 py-4 text-xs uppercase tracking-[0.1em]">Acciones</th> : null}</tr></thead><tbody>{rows.map((row) => <tr className="border-b border-[#d8d5cc] last:border-0 hover:bg-white" key={row.id}>{columns.map((column) => { const value = column.derive ? column.derive(row) : row[column.key]; return <td className="max-w-[320px] px-4 py-4" key={column.key}>{column.money ? currency(value) : column.key.toLowerCase().includes("status") ? <Status value={display(value)} /> : display(value)}</td>; })}{actions ? <td className="px-4 py-3"><div className="flex gap-4">{actions(row)}</div></td> : null}</tr>)}</tbody></table>{rows.length === 0 ? <EmptyState text="No hay registros para mostrar." /> : null}</section>;
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return <label className={`grid content-start gap-1.5 text-xs font-semibold text-[#4f524d] ${wide ? "sm:col-span-2 md:col-span-3" : ""}`}><span>{label}</span>{children}</label>;
}

function Status({ value }: { value: string }) {
  const positive = ["ACTIVE", "PAID", "COMPLETED", "SHIPPED", "SENT"].includes(value);
  const warning = ["DRAFT", "REVIEW", "PENDING_PAYMENT", "PREPARING"].includes(value);
  return <span className={`inline-flex min-h-7 items-center border px-2 text-[10px] font-bold uppercase tracking-[0.08em] ${positive ? "border-[#7da186] bg-[#e5eee7] text-[#24452c]" : warning ? "border-[#d3a66f] bg-[#f5eadb] text-[#764619]" : "border-[#aaa89f] bg-[#ebe9e2] text-[#595b57]"}`}>{value}</span>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="grid min-h-40 place-items-center border border-dashed border-[#aaa89f] bg-[#f4f1e9] p-8 text-center text-sm text-[#777a74]">{text}</div>;
}
