import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bell } from "lucide-react";
import { NotificationActions } from "@/components/notifications/notification-actions";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = Number(session.user.id);

  const items = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  const toneLabel = (tone: string) => {
    switch (tone) {
      case "warning": return "destructive" as const;
      case "error": return "destructive" as const;
      case "success": return "default" as const;
      default: return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">Notifikasi</h2>
          <p className="text-sm text-muted-foreground">
            Semua notifikasi untuk akun Anda
          </p>
        </div>
        <NotificationActions userId={userId} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={18} />
            Daftar Notifikasi ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Tidak ada notifikasi.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">Status</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className={item.status === "Belum Dibaca" ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}
                  >
                    <TableCell>
                      {item.status === "Belum Dibaca" && (
                        <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-64 truncate">
                      {item.detail}
                    </TableCell>
                    <TableCell>
                      <Badge variant={toneLabel(item.tone)}>{item.tone}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString("id-ID")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
