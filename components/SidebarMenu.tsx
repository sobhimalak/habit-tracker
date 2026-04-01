"use client";

import { useState } from "react";
import { X, ChevronRight, Home, List, BarChart2, History, Target, LogOut } from "lucide-react";
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
        className="fixed top-12 right-6 z-50 text-muted-foreground hover:text-foreground"
      >
        {/* We reuse this logic in headers, but having a global listener or a shared component is better. 
            For now, I'll export this and use it in all pages. Or just use the button already in pages to trigger this.
        */}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative bg-background w-[80%] max-w-xs h-full shadow-2xl p-8 flex flex-col animate-in slide-in-from-right duration-300 ml-auto border-l border-zinc-800">
            <header className="flex justify-between items-center mb-12">
              <h2 className="text-2xl font-bold tracking-tight">Menu</h2>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground">
                <X size={28} />
              </button>
            </header>

            <nav className="space-y-6 flex-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors ${pathname === link.href ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
                >
                  <div className="flex items-center space-x-4">
                    <link.icon size={24} />
                    <span className="font-bold text-lg">{link.name}</span>
                  </div>
                  <ChevronRight size={20} className="opacity-40" />
                </Link>
              ))}
            </nav>

            <button 
              onClick={() => signOut()}
              className="flex items-center space-x-4 p-2 text-zinc-500 hover:text-red-500 transition-colors mb-8"
            >
              <LogOut size={24} />
              <span className="font-bold text-lg">Log Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
