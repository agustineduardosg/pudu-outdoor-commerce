"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <main className="error-page">
          <p className="eyebrow">PUDU / Error</p>
          <h1>No pudimos completar esta ruta.</h1>
          <p>El incidente fue registrado sin incluir datos sensibles.</p>
          <button className="button button--dark" type="button" onClick={reset}>
            Intentar nuevamente
          </button>
        </main>
      </body>
    </html>
  );
}
