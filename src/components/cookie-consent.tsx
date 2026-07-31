"use client";

import { useEffect, useState } from "react";

type Consent = "all" | "essential" | null;
const CONSENT_KEY = "pudu-consent-v1";

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent>("essential");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hydrationTask = window.setTimeout(() => {
      const stored = window.localStorage.getItem(CONSENT_KEY);
      if (stored === "all" || stored === "essential") {
        setConsent(stored);
      } else {
        setConsent(null);
        setVisible(true);
      }
    }, 0);

    return () => window.clearTimeout(hydrationTask);
  }, []);

  function choose(value: Exclude<Consent, null>) {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
    setVisible(false);
    window.dispatchEvent(
      new CustomEvent("pudu:consent", { detail: { analytics: value === "all" } }),
    );
  }

  useEffect(() => {
    function reopen() {
      setVisible(true);
    }
    window.addEventListener("pudu:open-consent", reopen);
    return () => window.removeEventListener("pudu:open-consent", reopen);
  }, []);

  if (!visible) {
    return (
      <button
        className="consent-reopen"
        type="button"
        onClick={() => setVisible(true)}
      >
        Privacidad
      </button>
    );
  }

  return (
    <aside className="consent-panel" aria-label="Preferencias de privacidad">
      <div>
        <p className="eyebrow">Tu privacidad</p>
        <p>
          Usamos almacenamiento esencial para el carrito. La medición comercial
          solo se activa con tu permiso.
        </p>
      </div>
      <div className="consent-actions">
        <button className="button button--ghost" onClick={() => choose("essential")}>
          Solo esenciales
        </button>
        <button className="button button--light" onClick={() => choose("all")}>
          Aceptar medición
        </button>
      </div>
      <span className="sr-only" aria-live="polite">
        Preferencia actual: {consent ?? "sin elegir"}
      </span>
    </aside>
  );
}
