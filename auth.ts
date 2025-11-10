// auth.ts

import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GitHub from "next-auth/providers/github"
import { PrismaClient } from "@prisma/client"

// You must create a single instance of PrismaClient
const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    // This callback is essential for the Prisma adapter to work with the session
    async session({ session, user }) {
      // Add the user's ID to the session object
      session.user.id = user.id
      return session
    },
  },
})