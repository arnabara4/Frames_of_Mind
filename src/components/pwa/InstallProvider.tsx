"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

interface InstallContextValue {
  canInstall: boolean; // native prompt available (Chrome/Edge)
  isIOS: boolean; // needs the manual Share → Add to Home Screen flow
  installed: boolean; // already running as an installed app
  promptInstall: () => Promise<void>;
}

const InstallContext = createContext<InstallContextValue>({
  canInstall: false,
  isIOS: false,
  installed: false,
  promptInstall: async () => {},
});

export function InstallProvider({ children }: { children: React.ReactNode }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Register the service worker (makes the app installable + offline-capable).
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const nav = navigator as Navigator & { standalone?: boolean };
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      nav.standalone === true;
    if (standalone) setInstalled(true);

    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(ios && !standalone);

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    try {
      await deferred.userChoice;
    } catch {}
    setDeferred(null);
  }, [deferred]);

  return (
    <InstallContext.Provider
      value={{ canInstall: !!deferred, isIOS, installed, promptInstall }}
    >
      {children}
    </InstallContext.Provider>
  );
}

export const useInstall = () => useContext(InstallContext);
