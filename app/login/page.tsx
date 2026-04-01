"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isLogin) {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid credentials");
      } else {
        router.push("/");
        router.refresh();
      }
    } else {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (res.ok) {
        await signIn("credentials", { redirect: false, email, password });
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 px-8 py-16 animate-slide-up max-w-md mx-auto w-full">
      <header className="flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Signature H Logo */}
        
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-black tracking-tighter italic text-white">Habitify</h1>
          <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest pl-1">Level up your life</p>
        </div>
      </header>

      <main className="w-full space-y-10 pb-12">
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white">{isLogin ? "Welcome Back" : "Create Account"}</h2>
            <p className="text-xs text-zinc-500 font-medium">{isLogin ? "Enter your credentials to continue" : "Start your 100-day journey today"}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-premium"
                  placeholder="John Doe"
                />
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-premium"
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Password</label>
                {isLogin && (
                  <button type="button" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors italic">Forgot?</button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-premium"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl">
                <p className="text-danger text-[10px] text-center font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary h-14 text-[13px] tracking-[0.2em] italic"
              >
                {loading ? "..." : isLogin ? "LOG IN" : "SIGN UP"}
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center space-x-4 w-full">
            <div className="h-[1px] bg-zinc-900 flex-1" />
            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] italic">Or Auth With</span>
            <div className="h-[1px] bg-zinc-900 flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <button className="h-14 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl flex items-center justify-center space-x-3 active:scale-95 transition-all group">
              <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.176-1.152 1.152-2.904 2.384-6.192 2.384-5.352 0-9.624-4.344-9.624-9.696s4.272-9.696 9.624-9.696c2.88 0 5.112 1.128 6.648 2.568l2.328-2.328C19.144 1.48 16.2 0 12.48 0 5.672 0 0 5.672 0 12.48s5.672 12.48 12.48 12.48c3.704 0 6.648-1.216 8.744-3.416 2.136-2.126 2.808-5.112 2.808-7.552 0-.696-.056-1.352-.16-2.072h-11.41z"/>
              </svg>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">Google</span>
            </button>
            <button className="h-14 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl flex items-center justify-center space-x-3 active:scale-95 transition-all group">
              <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">Apple ID</span>
            </button>
          </div>

          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="flex items-center space-x-2 group"
          >
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{isLogin ? "Don't have an account?" : "Already member?"}</span>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest group-hover:text-emerald-400 transition-colors italic">{isLogin ? "Join Now" : "Sign In"}</span>
          </button>
        </div>
      </main>
    </div>
  );
}
