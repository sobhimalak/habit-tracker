"use client";

import { Share2 } from "lucide-react";

export default function ShareButton() {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Habit Tracker Premium",
          text: "Check out my progress on Habit Tracker!",
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
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-all border border-amber-500/20"
    >
      <Share2 size={18} />
      <span className="text-sm font-medium">Share Progress</span>
    </button>
  );
}
