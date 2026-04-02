"use client";
 
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Plus, Dumbbell, User, TrendingUp } from "lucide-react";

 
export default function BottomNav() {
  const pathname = usePathname();

  const isFullPage = pathname === "/login" || 
                    pathname === "/add" || 
                    pathname.startsWith("/habits/edit/") || 
                    pathname.startsWith("/exercises/") ||
                    pathname.includes("/log");

  if (isFullPage) return null;
 
  const navItems = [
    { icon: Home, path: "/", label: "Today" },
    { icon: Dumbbell, path: "/exercises", label: "Library" },
    { icon: Plus, path: "/add", label: "Add", center: true },
    { icon: TrendingUp, path: "/stats", label: "Progress" },
    { icon: User, path: "/profile", label: "Profile" },
  ];
 
  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-20 bg-zinc-900/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 flex items-center justify-between px-6 pointer-events-auto">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;
 
        if (item.center) {
          return (
            <Link
              key={item.path}
              href="/add"
              className="relative -top-8 w-16 h-16 bg-emerald-500 rounded-[2rem] flex items-center justify-center shadow-[0_10px_20px_rgba(16,185,129,0.3)] border-4 border-zinc-950 active:scale-90 transition-all hover:bg-emerald-400 group"
            >
              <Plus size={32} className="text-white group-hover:rotate-90 transition-transform duration-300" />
            </Link>
          );
        }
 
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center space-y-1 transition-all ${
              isActive ? "text-emerald-500" : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            <Icon size={22} className={isActive ? "scale-110" : ""} />
            <span className="text-[8px] font-black uppercase tracking-widest italic">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
