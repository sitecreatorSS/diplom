import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "SELLER" | "BUYER";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "SELLER" | "BUYER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMIN" | "SELLER" | "BUYER";
  }
}
