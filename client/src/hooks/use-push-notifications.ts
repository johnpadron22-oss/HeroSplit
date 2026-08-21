import { useState, useEffect, useCallback } from "react";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

/** Convert the base64url VAPID public key to a Uint8Array for the browser API. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from(rawData.split("").map((c) => c.charCodeAt(0)));
}

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

export interface UsePushNotificationsReturn {
  permission: PushPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  subscribe: (userId: string) => Promise<void>;
  unsubscribe: (userId: string) => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [permission, setPermission] = useState<PushPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Detect support & read current permission on mount
  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PushPermission);

    // Check if already subscribed
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setIsSubscribed(!!sub))
      .catch(() => {});
  }, []);

  const getOrRegisterSW = useCallback(async (): Promise<ServiceWorkerRegistration> => {
    // Register SW if not already registered
    let reg = await navigator.serviceWorker.getRegistration("/sw.js");
    if (!reg) {
      reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    }
    // Make sure it's active
    await navigator.serviceWorker.ready;
    return reg;
  }, []);

  const subscribe = useCallback(async (userId: string) => {
    if (permission === "unsupported") return;
    setIsLoading(true);
    try {
      const reg = await getOrRegisterSW();

      // Request permission if not yet granted
      if (Notification.permission !== "granted") {
        const result = await Notification.requestPermission();
        setPermission(result as PushPermission);
        if (result !== "granted") return;
      }

      // Subscribe to push
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send to our API
      const response = await fetch("/api/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subscription: subscription.toJSON() }),
      });

      if (!response.ok) throw new Error("Failed to save subscription");
      setIsSubscribed(true);
    } catch (err) {
      console.error("[push] subscribe error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [permission, getOrRegisterSW]);

  const unsubscribe = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        setIsSubscribed(false);
        return;
      }

      // Remove from our API first
      await fetch("/api/push-subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, endpoint: subscription.endpoint }),
      });

      // Then unsubscribe from browser
      await subscription.unsubscribe();
      setIsSubscribed(false);
    } catch (err) {
      console.error("[push] unsubscribe error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { permission, isSubscribed, isLoading, subscribe, unsubscribe };
}
