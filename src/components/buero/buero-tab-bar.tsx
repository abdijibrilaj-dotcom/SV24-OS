"use client";

import { TabBar } from "@/components/mobile/tab-bar";
import { BUERO_TABS } from "@/components/buero/tab-config";

export function BueroTabBar() {
  return <TabBar items={BUERO_TABS} />;
}
