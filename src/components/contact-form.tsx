"use client";

import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";

export function ContactForm({ defaultMessage = "" }: { defaultMessage?: string }) {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setStatus("");

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      topic: String(form.get("topic") ?? ""),
      message: String(form.get("message") ?? ""),
      company: String(form.get("company") ?? ""),
    };

    try {
      const response = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        setStatus(
          response.status === 503
            ? "El canal de soporte aún no está habilitado. Intenta nuevamente cuando se publiquen los datos oficiales."
            : "No pudimos enviar el mensaje. Revisa los campos e intenta nuevamente.",
        );
        return;
      }
      event.currentTarget.reset();
      setStatus("Recibimos tu mensaje. Te responderemos por correo.");
    } catch {
      setStatus("No pudimos conectar con el servicio. Intenta nuevamente.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="field-grid field-grid--two">
        <label>
          Nombre
          <input name="name" autoComplete="name" minLength={2} maxLength={80} required />
        </label>
        <label>
          Correo
          <input
            name="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            maxLength={254}
            required
          />
        </label>
        <label className="field-span">
          Motivo
          <select name="topic" autoComplete="off" defaultValue="producto">
            <option value="producto">Consulta de producto</option>
            <option value="pedido">Pedido y despacho</option>
            <option value="cambios">Cambios y devoluciones</option>
            <option value="marca">Marca y colaboraciones</option>
          </select>
        </label>
        <label className="field-span">
          Mensaje
          <textarea
            name="message"
            autoComplete="off"
            defaultValue={defaultMessage}
            minLength={10}
            maxLength={2_000}
            required
          />
        </label>
        <label className="contact-honeypot" aria-hidden="true">
          Empresa
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button className="button button--dark" type="submit" disabled={sending}>
        {sending ? "Enviando…" : "Enviar consulta"}
        <ArrowRight aria-hidden="true" size={18} />
      </button>
      <p className="form-status" role="status">
        {status}
      </p>
    </form>
  );
}
