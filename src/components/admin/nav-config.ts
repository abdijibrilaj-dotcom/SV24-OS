import {
  LayoutGrid,
  BarChart3,
  TrendingUp,
  Percent,
  Receipt,
  Calendar,
  Zap,
  Mail,
  Users,
  Building2,
  Folder,
  Shield,
  Database,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const ADMIN_NAV: NavGroup[] = [
  {
    title: "Übersicht",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutGrid },
      { href: "/admin/statistiken", label: "Statistiken", icon: BarChart3 },
    ],
  },
  {
    title: "Finanzen",
    items: [
      { href: "/admin/umsatz", label: "Umsatz", icon: TrendingUp },
      { href: "/admin/gewinn", label: "Gewinn", icon: Percent },
      { href: "/admin/rechnungen", label: "Rechnungen", icon: Receipt },
    ],
  },
  {
    title: "Betrieb",
    items: [
      { href: "/admin/kalender", label: "Kalender", icon: Calendar },
      { href: "/admin/dispatch", label: "Smart Dispatch", icon: Zap },
      { href: "/admin/email-import", label: "E-Mail-Import", icon: Mail },
    ],
  },
  {
    title: "Stammdaten",
    items: [
      { href: "/admin/dolmetscher", label: "Dolmetscher", icon: Users },
      { href: "/admin/auftraggeber", label: "Auftraggeber", icon: Building2 },
      { href: "/admin/dokumente", label: "Dokumente", icon: Folder },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/benutzer", label: "Benutzerverwaltung", icon: Shield },
      { href: "/admin/backups", label: "Backups", icon: Database },
      { href: "/admin/einstellungen", label: "Einstellungen", icon: Settings },
    ],
  },
];

export function sectionTitleForPath(pathname: string): string {
  for (const group of ADMIN_NAV) {
    for (const item of group.items) {
      if (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)) {
        return item.label;
      }
    }
  }
  return "Dashboard";
}
