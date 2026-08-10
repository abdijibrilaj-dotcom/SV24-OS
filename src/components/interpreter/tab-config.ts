import { House, Briefcase, Calendar, Wallet, User } from "lucide-react";
import type { TabItem } from "@/components/mobile/tab-bar";

export const INTERPRETER_TABS: TabItem[] = [
  { href: "/interpreter", label: "Home", icon: House },
  { href: "/interpreter/jobs", label: "Jobs", icon: Briefcase },
  { href: "/interpreter/kalender", label: "Kalender", icon: Calendar },
  { href: "/interpreter/auszahlungen", label: "Auszahlung", icon: Wallet },
  { href: "/interpreter/profil", label: "Profil", icon: User },
];
