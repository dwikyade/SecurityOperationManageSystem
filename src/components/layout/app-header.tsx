"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Bell, LogOut, Moon, Sun, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { markAsRead, markAllAsRead } from "@/app/actions/notifications";
import type { UserSession } from "@/lib/rbac";

type Notification = {
  id: number;
  userId: number | null;
  title: string;
  detail: string;
  tone: string;
  status: string;
  createdAt: Date;
};

export function AppHeader({ user }: { user: UserSession }) {
  const { theme, setTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
        setItems(data.items);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  async function handleMarkRead(id: number) {
    await markAsRead(id);
    fetchNotifications();
  }

  async function handleMarkAllRead() {
    await markAllAsRead(Number(user.id));
    fetchNotifications();
  }

  const toneColor = (tone: string) => {
    switch (tone) {
      case "warning": return "text-yellow-500";
      case "error": return "text-red-500";
      case "success": return "text-green-500";
      default: return "text-blue-500";
    }
  };

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

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifikasi</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-normal text-blue-500 hover:underline"
                >
                  Tandai semua dibaca
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {items.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Tidak ada notifikasi
              </div>
            ) : (
              <>
                {items.slice(0, 5).map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    className="flex flex-col items-start gap-1 p-3"
                    onClick={() => {
                      if (item.status === "Belum Dibaca") {
                        handleMarkRead(item.id);
                      }
                    }}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <span className={`text-xs font-bold ${toneColor(item.tone)}`}>
                        {item.status === "Belum Dibaca" && "● "}
                        {item.title}
                      </span>
                      {item.status === "Belum Dibaca" && (
                        <Check size={12} className="shrink-0 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-2">
                      {item.detail}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString("id-ID")}
                    </span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-xs text-blue-500">
                  <Link href="/notifications">Lihat semua notifikasi</Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

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
