"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installability/offline support is a progressive enhancement —
        // if registration fails (unsupported browser, blocked, etc.) the
        // site still works normally online.
      });
    }
  }, []);

  return null;
}
