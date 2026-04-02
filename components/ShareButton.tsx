"use client";

import { Share2 } from "lucide-react";

interface ShareButtonProps {
  title?: string;
}

export default function ShareButton({ title }: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "Forme Habits Premium",
          text: "Check out my progress on Forme Habits!",
          url: window.location.origin,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.origin);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-900/50 text-amber-500 border border-white/5 active:scale-95 transition-all"
    >
      <Share2 size={18} />
    </button>
  );
}
