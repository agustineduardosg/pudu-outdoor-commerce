"use client";

import { useEffect } from "react";

const gaId = process.env.NEXT_PUBLIC_GA4_ID;
const metaId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA_ID_PATTERN = /^G-[A-Z0-9]{6,16}$/;
const META_ID_PATTERN = /^\d{6,24}$/;

type FacebookQueue = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    fbq?: FacebookQueue;
    _fbq?: FacebookQueue;
  }
}

function setGaDisabled(id: string, disabled: boolean) {
  Object.assign(window, { [`ga-disable-${id}`]: disabled });
}

function enableAnalytics() {
  if (gaId && GA_ID_PATTERN.test(gaId)) {
    setGaDisabled(gaId, false);
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", gaId, { anonymize_ip: true });

    if (!document.getElementById("pudu-ga4")) {
      const script = document.createElement("script");
      script.id = "pudu-ga4";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      document.head.append(script);
    }
  }

  if (metaId && META_ID_PATTERN.test(metaId)) {
    if (!window.fbq) {
      const facebookQueue = ((...args: unknown[]) => {
        if (facebookQueue.callMethod) facebookQueue.callMethod(...args);
        else facebookQueue.queue.push(args);
      }) as FacebookQueue;
      facebookQueue.queue = [];
      facebookQueue.loaded = true;
      facebookQueue.version = "2.0";
      window.fbq = facebookQueue;
      window._fbq = facebookQueue;
    }
    window.fbq("consent", "grant");
    window.fbq("init", metaId);
    window.fbq("track", "PageView");

    if (!document.getElementById("pudu-meta-pixel")) {
      const script = document.createElement("script");
      script.id = "pudu-meta-pixel";
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.append(script);
    }
  }
}

function disableAnalytics() {
  if (gaId && GA_ID_PATTERN.test(gaId)) {
    setGaDisabled(gaId, true);
  }
  window.fbq?.("consent", "revoke");
}

export function ConsentedAnalytics() {
  useEffect(() => {
    const initialTask = window.setTimeout(() => {
      if (window.localStorage.getItem("pudu-consent-v1") === "all") {
        enableAnalytics();
      } else {
        disableAnalytics();
      }
    }, 0);

    function update(event: Event) {
      const detail = (event as CustomEvent<{ analytics?: boolean }>).detail;
      if (detail?.analytics) enableAnalytics();
      else disableAnalytics();
    }

    window.addEventListener("pudu:consent", update);
    return () => {
      window.clearTimeout(initialTask);
      window.removeEventListener("pudu:consent", update);
    };
  }, []);

  return null;
}
