"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  ShieldAlert,
  Package,
  ClipboardCheck,
  QrCode,
  FileSpreadsheet,
  Database,
  UserCog,
  Lock,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import type { UserSession, ModuleKey } from "@/lib/rbac";
import { getUserModules } from "@/lib/rbac";

const navItems: { key: ModuleKey; label: string; href: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard },
  { key: "patrol", label: "Patroli", href: "/patrol", icon: ShieldCheck },
  { key: "findings", label: "Temuan", href: "/findings", icon: ShieldAlert },
  { key: "goods", label: "Barang", href: "/goods", icon: Package },
  { key: "approval", label: "Approval", href: "/approval", icon: ClipboardCheck },
  { key: "gatepass", label: "Gate Pass", href: "/gatepass", icon: QrCode },
  { key: "reports", label: "Laporan", href: "/reports", icon: FileSpreadsheet },
  { key: "master-data", label: "Master Data", href: "/master-data", icon: Database },
  { key: "admin", label: "Admin", href: "/admin", icon: UserCog },
];

export function AppSidebar({ user }: { user: UserSession }) {
  const pathname = usePathname();
  const allowedModules = getUserModules(user.roles);

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-white">
            <ShieldCheck size={22} />
          </span>
          <div>
            <p className="text-lg font-black leading-tight">HSOMS</p>
            <p className="text-xs font-semibold text-muted-foreground">
              Hotel Security Ops
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const allowed = allowedModules.includes(item.key);
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                if (allowed) {
                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        render={<Link href={item.href} />}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      className="opacity-40 cursor-not-allowed"
                      disabled
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                      <Lock size={12} className="ml-auto" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {user.roles.join(", ")}
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
