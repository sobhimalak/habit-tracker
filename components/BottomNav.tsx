"use client";

import { Home, ListTodo, PlusCircle, Calendar, BarChart2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  const hideOn = ["/login", "/add", "/habits/edit", "/challenges/edit"];
  if (hideOn.some(path => pathname.startsWith(path))) return null;

  const navItems = [
    { href: "/", icon: Home, label: "Today" },
    { href: "/habits", icon: ListTodo, label: "Habits" },
    { href: "/add", icon: PlusCircle, label: "Add", main: true },
    { href: "/stats", icon: BarChart2, label: "Stats" },
    { href: "/history", icon: Calendar, label: "History" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#18181b]/90 backdrop-blur-md border-t border-[#27272a] z-50">
      <div className="flex justify-around items-center h-20 px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          if (item.main) {
            return (
              <Link key={item.href} href={item.href} className="relative -top-5">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/25 active:scale-95 transition-transform">
                  <Icon size={28} className="text-primary-foreground" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-16 h-full space-y-1 active:scale-95 transition-transform"
            >
              <Icon 
                size={24} 
                className={isActive ? "text-primary" : "text-muted-foreground"} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
