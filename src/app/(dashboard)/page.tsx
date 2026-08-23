import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  Clock3,
  XCircle,
} from "lucide-react";

const stats = [
  { label: "Patroli Hari Ini", value: "0", icon: ShieldCheck, variant: "default" as const },
  { label: "Checkpoint Selesai", value: "0%", icon: CheckCircle2, variant: "default" as const },
  { label: "Temuan Aktif", value: "0", icon: AlertTriangle, variant: "destructive" as const },
  { label: "Barang Masuk", value: "0", icon: ArrowDownToLine, variant: "secondary" as const },
  { label: "Barang Keluar", value: "0", icon: ArrowUpFromLine, variant: "outline" as const },
  { label: "Menunggu Approval", value: "0", icon: ClipboardCheck, variant: "default" as const },
  { label: "Belum Kembali", value: "0", icon: Clock3, variant: "outline" as const },
  { label: "Gate Pass Ditolak", value: "0", icon: XCircle, variant: "destructive" as const },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as {
    name: string;
    roles: string[];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Selamat datang, {user.name}.{" "}
          <Badge variant="secondary">{user.roles.join(", ")}</Badge>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Badge variant={stat.variant} className="h-8 w-8 p-0 justify-center">
                  <Icon size={16} />
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sistem Siap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Fondasi sistem telah terpasang. Modul-modul akan diaktifkan secara
            bertahap sesuai tahapan pengembangan pada PRD.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
