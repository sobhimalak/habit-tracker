"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, X, Calendar } from "lucide-react";

export default function EditChallenge() {
  const router = useRouter();
  const params = useParams();
  const [title, setTitle] = useState("");
  const [goalDays, setGoalDays] = useState("30");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchChallenge = async () => {
      const res = await fetch(`/api/challenges/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title);
        setGoalDays(data.goalDays.toString());
        setStartDate(data.startDate.split("T")[0]);
      }
      setLoading(false);
    };
    fetchChallenge();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/challenges/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, goalDays: parseInt(goalDays), startDate: new Date(startDate).toISOString() }),
    });

    if (res.ok) {
      router.back();
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
        <h1 className="text-xl font-bold tracking-tight">Edit Challenge</h1>
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-end text-muted-foreground">
          <X size={24} />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="px-6 py-4 space-y-8">
        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">Challenge Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#18181b] border border-[#27272a] rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-colors h-16 font-bold text-lg"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">Start Date</label>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#18181b] border border-[#27272a] rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-colors h-16 font-bold text-lg appearance-none"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">Total Days</label>
          <select
            value={goalDays}
            onChange={(e) => setGoalDays(e.target.value)}
            className="w-full bg-[#18181b] border border-[#27272a] rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-colors h-16 font-bold text-lg appearance-none"
          >
            <option value="7">7 Days</option>
            <option value="21">21 Days</option>
            <option value="30">30 Days</option>
            <option value="60">60 Days</option>
            <option value="100">100 Days</option>
          </select>
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
