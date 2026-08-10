import { Role } from "@prisma/client";

export type Portal = "admin" | "buero" | "interpreter";

export const PORTAL_ROLE: Record<Portal, Role> = {
  admin: Role.ADMIN,
  buero: Role.BUERO,
  interpreter: Role.INTERPRETER,
};

export const ROLE_PORTAL: Record<Role, Portal> = {
  ADMIN: "admin",
  BUERO: "buero",
  INTERPRETER: "interpreter",
};

export function isPortal(value: string): value is Portal {
  return value === "admin" || value === "buero" || value === "interpreter";
}
