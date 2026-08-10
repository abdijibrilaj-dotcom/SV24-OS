"use client";

import { TabBar } from "@/components/mobile/tab-bar";
import { INTERPRETER_TABS } from "@/components/interpreter/tab-config";

export function InterpreterTabBar() {
  return <TabBar items={INTERPRETER_TABS} />;
}
