"use client";

import { useState } from "react";
import { X, ChevronRight, Home, List, BarChart2, History, Target, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function SidebarMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/login") return null;

  const links = [
    { name: "Today", href: "/", icon: Home },
    { name: "My Habits", href: "/habits", icon: List },
    { name: "Statistics", href: "/stats", icon: BarChart2 },
    { name: "Past Entries", href: "/entries", icon: History },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-14 right-8 z-[100] h-12 w-12 bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-white transition-all shadow-xl active:scale-95"
      >
        <Menu size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500 animate-fade-in" onClick={() => setIsOpen(false)} />
          <div className="relative bg-zinc-950 w-[85%] max-w-xs h-full shadow-2xl p-10 flex flex-col animate-slide-in-right ml-auto border-l border-zinc-800/50">
            <header className="flex justify-between items-center mb-16">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 pl-1">Navigation</h2>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </header>

            <nav className="space-y-4 flex-1">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${isActive ? 'bg-zinc-900 border border-zinc-800' : 'hover:bg-zinc-900/50 hover:pl-6'}`}
                  >
                    <div className="flex items-center space-x-5">
                      <link.icon size={22} className={`${isActive ? 'text-primary' : 'text-zinc-600 group-hover:text-zinc-400'} transition-colors`} />
                      <span className={`font-black italic uppercase tracking-tight text-sm ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'} transition-colors`}>{link.name}</span>
                    </div>
                    <ChevronRight size={16} className={`${isActive ? 'text-primary' : 'text-zinc-800'} transition-all`} />
                  </Link>
                );
              })}
            </nav>

            <div className="pt-8 border-t border-zinc-900 space-y-8">
               <button 
                 onClick={() => signOut()}
                 className="flex items-center space-x-5 p-4 w-full text-zinc-600 hover:text-rose-500 transition-all group"
               >
                 <LogOut size={22} className="group-hover:scale-110 transition-transform" />
                 <span className="font-black italic uppercase tracking-tight text-sm">Log Out</span>
               </button>
               
               <div className="px-4">
                  <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em] italic">V1.0.4 PREMIUM</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
