"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, X, Trash2 } from "lucide-react";

export default function EditHabit() {
  const router = useRouter();
  const params = useParams();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✨");
  const [color, setColor] = useState("#10b981");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const SUGGESTED_ICONS = ["✨", "🏃", "💧", "📖", "🧘", "💪", "🍎", "💤", "💻", "🎵", "💰", "🎨"];
  const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f43f5e", "#f59e0b", "#06b6d4"];

  useEffect(() => {
    const fetchHabit = async () => {
      const res = await fetch(`/api/habits/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setName(data.name);
        setIcon(data.icon);
        setColor(data.color);
      }
      setLoading(false);
    };
    fetchHabit();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/habits/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon, color }),
    });

    if (res.ok) {
      router.push("/habits");
      router.refresh();
    }
    setSaving(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-muted-foreground font-bold">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      <header className="px-6 pt-12 pb-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-start text-muted-foreground">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Edit Habit</h1>
        <button onClick={() => router.push("/habits")} className="w-10 h-10 flex items-center justify-end text-muted-foreground">
          <X size={24} />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="px-6 py-4 space-y-8">
        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">Habit Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#18181b] border border-[#27272a] rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-colors h-16 font-bold text-lg"
            required
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">Choose Icon</label>
          <div className="grid grid-cols-5 gap-3">
            {SUGGESTED_ICONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={`aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all ${
                  icon === i ? "bg-foreground text-background scale-110 shadow-lg" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent max-w-md mx-auto">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-foreground text-background font-black text-xl h-16 rounded-2xl active:scale-[0.98] transition-all shadow-xl"
          >
            {saving ? "..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
