"use client";

import { usePathname } from "next/navigation";
import { ConsentedAnalytics } from "./consented-analytics";
import { CookieConsent } from "./cookie-consent";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return children;

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <SiteHeader />
      {children}
      <SiteFooter />
      <CookieConsent />
      <ConsentedAnalytics />
    </>
  );
}
