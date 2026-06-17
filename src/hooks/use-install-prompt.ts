import { useCallback, useEffect, useState } from "react";

/** The non-standard `beforeinstallprompt` event (Chromium browsers). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pdf2png:install-dismissed";

/** Detect whether the app is running as an installed standalone PWA. */
function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const displayStandalone = window.matchMedia("(display-mode: standalone)").matches;
  // iOS Safari exposes navigator.standalone instead of display-mode.
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return displayStandalone || iosStandalone;
}

/** Detect iOS / iPadOS (which has no `beforeinstallprompt`). */
function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIPad = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return /iPad|iPhone|iPod/.test(ua) || isIPad;
}

/** Result of {@link useInstallPrompt}. */
export interface InstallPromptState {
  /** True when the browser offers a native install prompt. */
  canInstall: boolean;
  /** True when already installed/running standalone. */
  isStandalone: boolean;
  /** True on iOS, where the user must "Add to Home Screen" manually. */
  isIOS: boolean;
  /** True if the user dismissed the prompt this session. */
  dismissed: boolean;
  /** Show the native install prompt; resolves to the user's choice. */
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
  /** Dismiss the custom prompt for this device. */
  dismiss: () => void;
}

/**
 * Manage the PWA install prompt lifecycle.
 *
 * @returns Install prompt state and actions.
 */
export function useInstallPrompt(): InstallPromptState {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(detectStandalone);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const onBeforeInstall = (event: Event): void => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = (): void => {
      setDeferred(null);
      setIsStandalone(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<
    "accepted" | "dismissed" | "unavailable"
  > => {
    if (!deferred) return "unavailable";
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    return choice.outcome;
  }, [deferred]);

  const dismiss = useCallback((): void => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  return {
    canInstall: deferred !== null,
    isStandalone,
    isIOS: detectIOS(),
    dismissed,
    promptInstall,
    dismiss,
  };
}
