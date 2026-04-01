"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X, Calendar, Target } from "lucide-react";
import Link from "next/link";

export default function EditChallenge({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [goalDays, setGoalDays] = useState(100);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchChallenge = async () => {
      const res = await fetch(`/api/challenges/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title);
        setGoalDays(data.goalDays);
      }
      setLoading(false);
    };
    fetchChallenge();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/challenges/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, goalDays }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure? This will delete the challenge and all progress.")) return;
    const res = await fetch(`/api/challenges/${params.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-zinc-500 font-black tracking-widest italic animate-pulse">LOADING...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 px-8 py-12 animate-slide-up max-w-md mx-auto w-full pb-32">
      <header className="flex items-center justify-between mb-16">
        <button onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 italic">Settings</h1>
        <div className="w-7" />
      </header>
 
      <main className="flex-1 space-y-12">
        <div className="space-y-4">
          <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">Challenge</h2>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] pl-1 italic">Update your 100-day journey</p>
        </div>
 
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] pl-1">Challenge Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-premium h-14 text-lg font-black italic tracking-tight"
                placeholder="2022 Challenge"
                required
              />
            </div>
 
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] pl-1">Total Goal Days</label>
              <div className="relative group">
                <select
                  value={goalDays}
                  onChange={(e) => setGoalDays(parseInt(e.target.value))}
                  className="input-premium h-14 bg-zinc-900/40 font-black italic text-lg tracking-tight pl-4 appearance-none"
                >
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                  <option value="100">100 Days</option>
                  <option value="365">365 Days</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-700">
                   <Target size={18} />
                </div>
              </div>
            </div>
          </div>
 
          <div className="pt-8 space-y-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary h-14 text-[13px] tracking-[0.2em] italic"
            >
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </button>
 
            <button
              type="button"
              onClick={handleDelete}
              className="btn-destructive h-14 text-[13px] tracking-[0.2em] italic"
            >
              DELETE CHALLENGE
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
