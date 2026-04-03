"use client";

import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 px-8 py-20 animate-slide-up max-w-md mx-auto w-full items-center justify-center text-center space-y-12">
      {/* Brand Header */}
      <div className="space-y-4">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 mx-auto mb-8">
          <span className="text-5xl font-black italic text-emerald-500">F</span>
        </div>
        <h1 className="text-6xl font-black tracking-tighter italic text-white uppercase leading-none">
          Forme<br />Habits
        </h1>
        <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.4em] italic pl-2">
          Elevate Your Existence
        </p>
      </div>

      {/* Main Action Area */}
      <div className="w-full space-y-4 pt-12">
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full h-16 bg-white text-black font-black uppercase tracking-widest text-xs italic rounded-2xl flex items-center justify-center space-x-3 active:scale-95 transition-all shadow-2xl shadow-white/5 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-emerald-500/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
          <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="relative z-10">Continue with Google</span>
        </button>

        <button
          onClick={() => window.location.href = "/login"}
          className="w-full h-14 bg-transparent border border-zinc-900 text-zinc-600 font-black uppercase tracking-widest text-[10px] italic rounded-2xl flex items-center justify-center space-x-2 hover:bg-zinc-900/40 hover:text-zinc-400 transition-all active:scale-95"
        >
          <span>Use Email Instead</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Social Proof / Footer */}
      <div className="pt-12">
        <p className="text-[9px] font-black text-zinc-800 uppercase tracking-widest italic">
          Join 0 high-performers today
        </p>
      </div>
    </div>
  );
}
