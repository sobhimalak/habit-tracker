"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export default function NotificationHub() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setPermission(Notification.permission);
      checkSubscription();
    } else {
      setError("Push not supported");
      setLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      // Use getRegistration() instead of .ready to avoid blocking the UI
      // If none exists, it's null (not subscribed)
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } else {
        setIsSubscribed(false);
      }
    } catch (err) {
      console.error("Error checking subscription:", err);
    }
    setLoading(false);
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!VAPID_PUBLIC_KEY) {
        throw new Error("VAPID Key missing");
      }

      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result !== "granted") {
        throw new Error("Permission denied");
      }

      // Try to register our custom worker for push
      // We use the same name as next-pwa if possible or a dedicated one
      const registration = await navigator.serviceWorker.register("/custom-sw.js", {
        scope: "/",
        updateViaCache: "none",
      });

      // Wait for it to be ready
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setIsSubscribed(true);
      } else {
        throw new Error("Failed to save to server");
      }
    } catch (err: any) {
      console.error("Subscription failed:", err);
      setError(err.message || "Failed to enable");
    }
    setLoading(false);
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await fetch("/api/notifications/subscribe", {
          method: "DELETE",
          body: JSON.stringify({ endpoint: subscription.endpoint }),
          headers: { "Content-Type": "application/json" },
        });
        setIsSubscribed(false);
      }
    } catch (err) {
      console.error("Unsubscription failed:", err);
      setError("Failed to disable");
    }
    setLoading(false);
  };

  if (loading && !isSubscribed) return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="animate-spin text-emerald-500" size={24} />
    </div>
  );

  return (
    <div className="space-y-4 animate-slide-up">
      <div className={`premium-card p-6 flex items-center justify-between transition-all duration-500 ${isSubscribed ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]' : 'bg-zinc-900/20 border-zinc-900/50'}`}>
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${isSubscribed ? 'bg-emerald-500 text-white border-emerald-400 rotate-0' : 'bg-zinc-950 text-zinc-600 border-zinc-900'}`}>
            {isSubscribed ? <Bell size={20} className="animate-wiggle" /> : <BellOff size={20} />}
          </div>
          <div className="text-left space-y-0.5">
            <p className={`text-xs font-black uppercase italic tracking-wider leading-none transition-colors ${isSubscribed ? 'text-emerald-500' : 'text-zinc-500'}`}>
              Reminders
            </p>
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
              {isSubscribed ? "System Active" : "Status: Disabled"}
            </p>
          </div>
        </div>
        
        <button
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={loading || permission === "denied"}
          className={`px-8 h-12 rounded-2xl text-[9px] font-black uppercase tracking-widest italic transition-all active:scale-95 flex items-center justify-center min-w-[100px] ${
            isSubscribed 
              ? 'bg-zinc-950/50 border border-zinc-800 text-zinc-500 hover:border-rose-500/30 hover:text-rose-500' 
              : 'bg-emerald-500 text-white shadow-[0_10px_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400'
          } ${loading ? 'opacity-50 cursor-wait' : ''} ${permission === "denied" ? 'opacity-20 cursor-not-allowed bg-zinc-900 text-zinc-700 shadow-none' : ''}`}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : (isSubscribed ? "OFF" : "ENABLE")}
        </button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 px-4 py-3 bg-rose-500/5 border border-rose-500/20 rounded-2xl animate-shake">
          <AlertCircle size={12} className="text-rose-500 shrink-0" />
          <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest italic">{error}</p>
        </div>
      )}

      {isSubscribed && !error && (
        <div className="flex items-center space-x-2 px-6">
          <CheckCircle2 size={12} className="text-emerald-500" />
          <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest italic">Signal Linked</p>
        </div>
      )}
      
      {permission === "denied" && (
        <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest italic text-center leading-relaxed">
          Notifications blocked by browser.<br/>Reset site permissions to enable.
        </p>
      )}
    </div>
  );
}
