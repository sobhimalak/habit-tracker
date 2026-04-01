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
    <div className="flex flex-col min-h-screen p-6 justify-center bg-background max-w-sm mx-auto w-full space-y-12">
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors h-12"
                placeholder="Name"
              />
            </div>
          )}
          <div className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors h-12"
              placeholder="Email"
              required
            />
          </div>
          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors h-12"
              placeholder="Password"
              required
            />
          </div>

          {error && <p className="text-destructive text-sm text-center font-bold mt-2">{error}</p>}

          <div className="pt-4 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "..." : isLogin ? "Log In" : "Sign Up"}
            </button>
            
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="btn-secondary"
            >
              {isLogin ? "Sign Up" : "Back to Login"}
            </button>
          </div>
        </form>

        {isLogin && (
          <div className="text-center">
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Forgot Password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
