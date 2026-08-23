import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, userRoles, roles, activityLogs, departments } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCog, ShieldCheck, Activity, Users } from "lucide-react";
import { AdminCreateDialog } from "@/components/admin/admin-form-dialog";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const deptList = await db.select({ code: departments.code, name: departments.name }).from(departments);

  const userList = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      departmentCode: users.departmentCode,
      status: users.status,
      roleName: roles.name,
    })
    .from(users)
    .leftJoin(userRoles, eq(users.id, userRoles.userId))
    .leftJoin(roles, eq(userRoles.roleId, roles.id));

  const roleList = await db.select().from(roles);

  const logs = await db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(50);

  const [totalUsersResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);
  const totalUsers = totalUsersResult?.count ?? 0;

  const [activeUsersResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(sql`${users.status} = 'Aktif'`);
  const activeUsers = activeUsersResult?.count ?? 0;

  const stats = [
    { label: "Total Pengguna", value: String(totalUsers), icon: Users },
    { label: "Pengguna Aktif", value: String(activeUsers), icon: ShieldCheck },
    { label: "Total Peran/Role", value: String(roleList.length), icon: UserCog },
    { label: "Log Aktivitas", value: String(logs.length), icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">Admin & Pengguna</h2>
          <p className="text-sm text-muted-foreground">
            Pengelolaan akun pengguna, peran, dan log aktivitas sistem
          </p>
        </div>
        <AdminCreateDialog roles={roleList} departments={deptList} />
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
                <Icon size={18} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Pengguna ({totalUsers})</TabsTrigger>
          <TabsTrigger value="roles">Role / Peran ({roleList.length})</TabsTrigger>
          <TabsTrigger value="logs">Log Aktivitas ({logs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle>Daftar Pengguna</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userList.map((u) => (
                    <TableRow key={`${u.id}-${u.roleName}`}>
                      <TableCell className="font-mono text-xs">{u.id}</TableCell>
                      <TableCell className="font-bold">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.departmentCode ?? "-"}</TableCell>
                      <TableCell><Badge variant="outline">{u.roleName ?? "-"}</Badge></TableCell>
                      <TableCell><Badge variant="secondary">{u.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader><CardTitle>Daftar Role / Peran</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nama Role</TableHead>
                    <TableHead>Deskripsi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roleList.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell className="font-bold">{r.name}</TableCell>
                      <TableCell>{r.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader><CardTitle>Log Aktivitas Sistem</CardTitle></CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada log aktivitas.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Pengguna</TableHead>
                      <TableHead>Aksi</TableHead>
                      <TableHead>Modul</TableHead>
                      <TableHead>Ref</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-mono text-xs">{l.id}</TableCell>
                        <TableCell>{String(l.createdAt)}</TableCell>
                        <TableCell>{l.userName}</TableCell>
                        <TableCell>{l.action}</TableCell>
                        <TableCell>{l.module}</TableCell>
                        <TableCell className="font-mono text-xs">{l.referenceNumber}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
