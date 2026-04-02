import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Forme Habits",
  description: "A premium mobile-first habit tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Habits",
  },
  themeColor: "#09090b",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-foreground antialiased selection:bg-emerald-500/30`}>
        <AuthProvider>
          <div className="flex justify-center min-h-screen">
            <main className="w-full max-w-md bg-zinc-950 relative">
              {children}
              <BottomNav />
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
