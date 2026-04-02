"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellOff, Loader2, CheckCircle2 } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export default function NotificationHub() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setPermission(Notification.permission);
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    setIsSubscribed(!!subscription);
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
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") {
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.register("/custom-sw.js", {
        scope: "/",
        updateViaCache: "none",
      });

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
      });

      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) setIsSubscribed(true);
    } catch (error) {
      console.error("Subscription failed:", error);
    }
    setLoading(false);
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await fetch("/api/notifications/subscribe", {
          method: "DELETE",
          body: JSON.stringify({ endpoint: subscription.endpoint }),
          headers: { "Content-Type": "application/json" },
        });
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error("Unsubscription failed:", error);
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-4">
      <Loader2 className="animate-spin text-emerald-500" size={20} />
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between p-6 bg-zinc-900/30 border border-zinc-900 rounded-[2rem] hover:border-emerald-500/10 transition-all">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-zinc-900 transition-colors ${isSubscribed ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-950 text-zinc-600'}`}>
            {isSubscribed ? <Bell size={20} /> : <BellOff size={20} />}
          </div>
          <div className="text-left space-y-0.5">
            <p className="text-xs font-black text-white uppercase italic tracking-wider leading-none">
              PUSH REMINDERS
            </p>
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
              {isSubscribed ? "Reminders are active" : "Get notified on habits"}
            </p>
          </div>
        </div>
        
        <button
          onClick={isSubscribed ? unsubscribe : subscribe}
          className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest italic transition-all active:scale-95 border ${isSubscribed ? 'bg-zinc-950 border-zinc-800 text-zinc-500' : 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}
        >
          {isSubscribed ? "DISABLE" : "ENABLE"}
        </button>
      </div>

      {isSubscribed && (
        <div className="flex items-center space-x-2 px-6">
          <CheckCircle2 size={12} className="text-emerald-500" />
          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic animate-pulse">Endpoint linked to profile</p>
        </div>
      )}
    </div>
  );
}
