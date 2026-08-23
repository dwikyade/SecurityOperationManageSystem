"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import type { UserSession } from "@/lib/rbac";

export function AppHeader({ user }: { user: UserSession }) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Security Operations
        </p>
        <h1 className="truncate text-lg font-black">
          Hotel Security Operations Management System
        </h1>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        <Button variant="ghost" size="icon">
          <Bell size={18} />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <span className="hidden text-sm font-semibold md:inline">
          {user.name}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  );
}
