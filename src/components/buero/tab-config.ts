import { House, Briefcase, Calendar, Receipt, Menu } from "lucide-react";
import type { TabItem } from "@/components/mobile/tab-bar";

export const BUERO_TABS: TabItem[] = [
  { href: "/buero", label: "Home", icon: House },
  { href: "/buero/jobs", label: "Aufträge", icon: Briefcase },
  { href: "/buero/kalender", label: "Kalender", icon: Calendar },
  { href: "/buero/rechnungen", label: "Rechnungen", icon: Receipt },
  { href: "/buero/mehr", label: "Mehr", icon: Menu },
];
