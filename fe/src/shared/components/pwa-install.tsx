"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";

const PWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Update UI notify the user they can install the PWA
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    // Handle the outcome silently or with user feedback
    if (outcome === "accepted") {
      // User accepted the install prompt
    } else {
      // User dismissed the install prompt
    }

    // Clear the deferredPrompt for next time
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  if (!showInstallButton) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <Button
        onClick={handleInstallClick}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow-lg hover:bg-blue-700"
      >
        앱 설치하기
      </Button>
    </div>
  );
};

export default PWAInstall;
