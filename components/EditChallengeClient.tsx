"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";

export default function EditChallengeClient({ challenge }: { challenge: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(challenge.title);
  const [goalDays, setGoalDays] = useState(challenge.goalDays);
  const [startDate, setStartDate] = useState(challenge.startDate.split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/challenges/${challenge.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, goalDays, startDate }),
    });
    if (res.ok) router.push(`/challenges/${challenge.id}`);
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background px-6">
      <header className="pt-12 pb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-muted-foreground">
          <ChevronLeft size={28} />
        </button>
        <button onClick={() => router.push('/')} className="text-muted-foreground">
          <X size={28} />
        </button>
      </header>

      <div className="text-center mb-12">
        <h1 className="text-2xl font-bold tracking-tight">Edit Challenge</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 flex-1">
        <div className="space-y-2">
          <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest ml-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors h-12"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest ml-1">Days</label>
          <select
            value={goalDays}
            onChange={(e) => setGoalDays(Number(e.target.value))}
            className="w-full bg-[#27272a] border-none rounded-lg px-4 py-3 focus:outline-none h-12 font-bold appearance-none"
          >
            <option value="7">7 Days</option>
            <option value="21">21 Days</option>
            <option value="30">30 Days</option>
            <option value="60">60 Days</option>
            <option value="100">100 Days</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest ml-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-transparent border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors h-12"
            required
          />
        </div>

        <div className="fixed bottom-12 left-0 right-0 px-6 max-w-md mx-auto">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
