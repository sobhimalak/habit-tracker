"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, User } from "lucide-react";

export default function Profile() {
  const { data: session } = useSession();

  return (
    <div className="p-4 pt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile</h1>
      </header>
      
      <div className="premium-card p-6 flex flex-col items-center text-center mb-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
          <User size={32} />
        </div>
        <h2 className="text-xl font-bold mb-1">{session?.user?.name || "User"}</h2>
        <p className="text-muted-foreground">{session?.user?.email}</p>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full bg-destructive/10 text-destructive font-bold text-lg rounded-xl h-14 flex items-center justify-center space-x-2 active:scale-95 transition-all"
      >
        <LogOut size={20} />
        <span>Sign Out</span>
      </button>
    </div>
  );
}
