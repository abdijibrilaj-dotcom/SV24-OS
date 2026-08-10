import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PORTAL_ROLE, ROLE_PORTAL, type Portal } from "@/lib/portals";

const PORTALS: Portal[] = ["admin", "buero", "interpreter"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const portal = PORTALS.find(
    (p) => pathname === `/${p}` || pathname.startsWith(`/${p}/`)
  );
  if (!portal) return NextResponse.next();

  const isLoginPage = pathname === `/${portal}/login`;
  const isResetPage = pathname === `/${portal}/passwort-aendern`;

  if (!session?.user) {
    if (isLoginPage) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = `/${portal}/login`;
    return NextResponse.redirect(url);
  }

  if (session.user.role !== PORTAL_ROLE[portal]) {
    const url = req.nextUrl.clone();
    url.pathname = `/${ROLE_PORTAL[session.user.role]}`;
    return NextResponse.redirect(url);
  }

  if (isLoginPage) {
    const url = req.nextUrl.clone();
    url.pathname = `/${portal}`;
    return NextResponse.redirect(url);
  }

  if (session.user.mustResetPassword && !isResetPage) {
    const url = req.nextUrl.clone();
    url.pathname = `/${portal}/passwort-aendern`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/buero/:path*", "/interpreter/:path*"],
};
