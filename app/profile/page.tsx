"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, User, Calendar, ChevronRight, Settings, Shield, Bell, BellOff } from "lucide-react";
import Link from "next/link";
import NotificationHub from "@/components/NotificationHub";

export default function Profile() {
  const { data: session } = useSession();

  const menuItems = [
    { 
      icon: Shield, 
      label: "Security", 
      desc: "Passwords and authentication", 
      path: "#",
      color: "text-zinc-500"
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 px-8 py-12 animate-slide-up pb-32 max-w-md mx-auto w-full">
      <header className="mb-12 space-y-2">
        <h1 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-600 italic">User Profile</h1>
        <p className="text-3xl font-black italic tracking-tighter text-white uppercase">Identity</p>
      </header>
      
      <main className="flex-1 space-y-12">
        {/* Profile Card */}
        <div className="premium-card bg-[#111113] p-8 flex flex-col items-center text-center shadow-2xl shadow-black/40 border border-zinc-900 rounded-[3rem]">
          <div className="relative group mb-6">
            <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
            <div className="w-24 h-24 bg-zinc-900 border-2 border-zinc-800 rounded-full flex items-center justify-center text-emerald-500 shadow-xl relative z-10">
              <User size={40} />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">
              {session?.user?.name || "Member"}
            </h2>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{session?.user?.email}</p>
          </div>
        </div>

        {/* Action Menu & Notifications */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-zinc-700 uppercase tracking-widest px-2 italic text-center">Alert System</h3>
            <NotificationHub />
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-zinc-700 uppercase tracking-widest px-2 italic">Management</h3>
            <div className="space-y-3">
              <Link
                href="/history"
                className="flex items-center justify-between p-6 bg-zinc-900/30 border border-zinc-900 rounded-[2rem] hover:border-emerald-500/30 transition-all group active:scale-[0.98]"
              >
                <div className="flex items-center space-x-5">
                  <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-900 text-emerald-500 group-hover:border-emerald-500/20 transition-colors">
                    <Calendar size={20} />
                  </div>
                  <div className="text-left space-y-0.5">
                    <p className="text-xs font-black text-white uppercase italic tracking-wider leading-none">Habit History</p>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Review your journal</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
              </Link>
              
              {menuItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.path}
                  className="flex items-center justify-between p-6 bg-zinc-900/30 border border-zinc-900 rounded-[2rem] hover:border-emerald-500/30 transition-all group active:scale-[0.98]"
                >
                  <div className="flex items-center space-x-5">
                    <div className={`w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-900 ${item.color} group-hover:border-emerald-500/20 transition-colors`}>
                      <item.icon size={20} />
                    </div>
                    <div className="text-left space-y-0.5">
                      <p className="text-xs font-black text-white uppercase italic tracking-wider leading-none">{item.label}</p>
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="pt-6">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="btn-primary h-14 bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white text-[12px] tracking-[0.2em] italic"
          >
            <LogOut size={18} />
            <span>CLOSE SESSION</span>
          </button>
        </div>
      </main>
    </div>
  );
}
