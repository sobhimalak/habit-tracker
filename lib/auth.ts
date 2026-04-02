import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user || !user.passwordHash) return null;
        
        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
        
        if (!isPasswordValid) return null;
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async signIn({ user, account, profile }) {
      if (process.env.NODE_ENV === "development") {
        console.log("Auth SignIn Attempt:", { email: user.email, provider: account?.provider });
      }
      return true;
    },
    async session({ session, token, user }) {
      if (process.env.NODE_ENV === "development") {
        console.log("Auth Session Callback:", { sub: token?.sub, userId: user?.id });
      }
      if (session.user) {
        session.user.id = (token?.sub as string) || (user?.id as string);
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (process.env.NODE_ENV === "development") {
        console.log("Auth JWT Callback:", { userId: user?.id, existingSub: token.sub });
      }
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  }
};
