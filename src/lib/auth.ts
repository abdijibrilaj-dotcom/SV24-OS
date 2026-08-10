import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Salutation } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PORTAL_ROLE, isPortal } from "@/lib/portals";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {},
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        portal: {},
        salutation: {},
      },
      async authorize(creds) {
        const email = String(creds?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(creds?.password ?? "");
        const portal = String(creds?.portal ?? "");
        if (!email || !password || !isPortal(portal)) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { interpreter: true },
        });
        if (!user || user.status === "INAKTIV") return null;
        if (user.role !== PORTAL_ROLE[portal]) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Interpreter-Login trägt die Anrede — einziges Feld dafür ist
        // Interpreter.salutation, es gibt keine Zweitspeicherung im User.
        const salutationRaw = String(creds?.salutation ?? "");
        if (
          user.interpreter &&
          (salutationRaw === "HERR" || salutationRaw === "FRAU") &&
          salutationRaw !== user.interpreter.salutation
        ) {
          await prisma.interpreter.update({
            where: { id: user.interpreter.id },
            data: { salutation: salutationRaw as Salutation },
          });
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mustResetPassword: user.mustResetPassword,
          interpreterId: user.interpreter?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
        token.mustResetPassword = user.mustResetPassword;
        token.interpreterId = user.interpreterId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.uid;
      session.user.role = token.role;
      session.user.mustResetPassword = token.mustResetPassword;
      session.user.interpreterId = token.interpreterId ?? null;
      return session;
    },
  },
});
