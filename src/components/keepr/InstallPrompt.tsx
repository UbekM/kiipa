import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download, Info } from "lucide-react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showMinimal, setShowMinimal] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");
    setIsInstalled(isStandalone);
    if (isStandalone) {
      console.log("[PWA] App is already installed (standalone mode)");
      return;
    }

    // Listen for beforeinstallprompt
    const handler = (e: any) => {
      console.log("[PWA] beforeinstallprompt event fired", e);
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      setShowPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Listen for appinstalled
    const onInstalled = () => {
      console.log("[PWA] appinstalled event fired");
      setIsInstalled(true);
      setShowPrompt(false);
      setShowMinimal(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", onInstalled);

    // Show minimal prompt after 10s, full after 30s
    const minimalTimeout = setTimeout(() => {
      setShowMinimal(true);
      console.log("[PWA] Minimal install prompt shown");
    }, 10000);
    const fullTimeout = setTimeout(() => {
      setShowPrompt(true);
      console.log("[PWA] Full install prompt shown");
    }, 30000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
      clearTimeout(minimalTimeout);
      clearTimeout(fullTimeout);
    };
  }, []);

  // Always use the deferredPrompt if available
  const handleInstall = useCallback(async () => {
    console.log("[PWA] Install button clicked", { deferredPrompt });
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("[PWA] User choice", outcome);
    if (outcome === "accepted") {
      setShowPrompt(false);
      setShowMinimal(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  useEffect(() => {
    console.log("[PWA] InstallPrompt state", {
      isInstalled,
      isInstallable,
      showPrompt,
      showMinimal,
      deferredPrompt,
    });
  }, [isInstalled, isInstallable, showPrompt, showMinimal, deferredPrompt]);

  if (isInstalled) return null;

  // Show install button if event is available
  if ((showPrompt || showMinimal) && deferredPrompt) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          size="sm"
          className="bg-forest-deep text-white hover:bg-forest-deep/90 shadow-lg"
          onClick={handleInstall}
        >
          <Download className="w-4 h-4 mr-2" />
          Install App
        </Button>
      </div>
    );
  }

  // Show info/help button if not installable
  if ((showPrompt || showMinimal) && !deferredPrompt) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          size="sm"
          variant="outline"
          className="bg-white/95 backdrop-blur-sm border-forest-deep/10 hover:bg-forest-deep/5 shadow-lg flex items-center text-black"
          onClick={() => setShowInfo((v) => !v)}
        >
          <Info className="w-4 h-4 mr-2 text-black" />
          How to Install
        </Button>
        {showInfo && (
          <div className="mt-2 p-3 rounded-xl bg-white/95 text-black text shadow-lg border border-forest-deep/10 text-xs max-w-xs">
            <b>To install:</b> Use your browser's menu or address bar (look for
            an install or "+" icon) to add Keepr to your device.
          </div>
        )}
      </div>
    );
  }

  return null;
}
