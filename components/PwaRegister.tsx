"use client";
import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister()))
      );
      if ("caches" in window) {
        void caches.keys().then((names) =>
          Promise.all(
            names
              .filter((name) => name.startsWith("pyrun-studio-"))
              .map((name) => caches.delete(name))
          )
        );
      }
      return;
    }

    void navigator.serviceWorker.register("/sw.js");
  }, []);
  return null;
}
