"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";

export default function EditHabit() {
  const router = useRouter();
  const params = useParams();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✨");
  const [color, setColor] = useState("#10b981");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState("08:30");

  const ICONS  = ["✨", "🏃", "💧", "📖", "🧘", "💪", "🍎", "💤", "💻", "🎵", "💰", "🎨"];
  const COLORS = ["#71717a", "#ef4444", "#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#06b6d4"];

  useEffect(() => {
    const fetchHabit = async () => {
      const res = await fetch(`/api/habits/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setName(data.name   ?? "");
        setIcon(data.icon   ?? "✨");
        setColor(data.color ?? "#10b981");
        if (data.reminderTime) {
          setShowReminder(true);
          setReminderTime(data.reminderTime);
        }
      } else {
        setError("Failed to load habit.");
      }
      setLoading(false);
    };
    fetchHabit();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/habits/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name: name.trim(), 
        icon, 
        color,
        reminderTime: showReminder ? reminderTime : null
      }),
    });
 
    if (res.ok) {
      router.push("/habits");
      router.refresh();
    } else {
      setError("Failed to save changes.");
    }
    setSaving(false);
  };
 
  const handleToggleReminder = async () => {
    if (!showReminder) {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setError("Notification permission is required for alerts.");
          return;
        }
 
        if ("serviceWorker" in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
              const pubKeyRes = await fetch("/api/notifications/vapid-public-key");
              if (pubKeyRes.ok) {
                const { publicKey } = await pubKeyRes.json();
                await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: publicKey
                });
              }
            }
          } catch (err) {
            console.error("SW/Subscription error:", err);
          }
        }
      }
    }
    setShowReminder(!showReminder);
  };
 
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-zinc-950 text-zinc-500 font-black italic text-xs uppercase tracking-widest">
      Loading...
    </div>
  );
 
  return (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-screen bg-zinc-950 px-8 py-12 animate-slide-up max-w-md mx-auto w-full">
      <header className="flex items-center justify-between mb-12">
        <button type="button" onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 italic">Edit Habit</h1>
        <button type="button" onClick={() => router.push("/habits")} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <X size={22} />
        </button>
      </header>

      <main className="flex-1 space-y-10">
        {/* Name */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Habit Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Go for a run..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all text-white font-medium"
            required
            autoFocus
          />
        </div>

        {/* Icon */}
        <div className="space-y-4 pt-4 border-t border-zinc-900">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Icon</label>
          <div className="flex flex-wrap gap-3">
            {ICONS.map(i => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                  icon === i
                    ? "bg-emerald-500 scale-110 shadow-lg shadow-emerald-500/20"
                    : "bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="space-y-4 pt-4 border-t border-zinc-900">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Color</label>
          <div className="flex flex-wrap gap-4">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-all ${
                  color === c
                    ? "ring-2 ring-white ring-offset-4 ring-offset-zinc-950 scale-110"
                    : "opacity-60 hover:opacity-100 hover:scale-110"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Alert Schedule */}
        <div className="space-y-6 pt-4 border-t border-zinc-900">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Alert Schedule</label>
              <p className="text-[10px] text-zinc-500 italic pl-1">Receive a signal at your peak time</p>
            </div>
            <button 
              type="button" 
              onClick={() => setShowReminder(!showReminder)}
              className={`w-12 h-6 rounded-full transition-all relative ${showReminder ? 'bg-emerald-500' : 'bg-zinc-800'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showReminder ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
 
          {showReminder && (
            <div className="space-y-4 animate-slide-up">
              <div className="relative group">
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-all text-white font-black text-xl italic text-center appearance-none"
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500/40 pointer-events-none group-focus-within:text-emerald-500 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </div>
 
        {error && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic">{error}</p>}
      </main>

      <div className="pt-8">
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full bg-emerald-500 text-white font-black text-sm h-14 rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-emerald-500/20"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
