import { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    mustResetPassword: boolean;
    interpreterId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      mustResetPassword: boolean;
      interpreterId?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: Role;
    uid: string;
    mustResetPassword: boolean;
    interpreterId?: string | null;
  }
}
