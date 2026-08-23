import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { patrolRecords } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, User, Calendar, Clock, MapPin, AlertTriangle } from "lucide-react";
import { PatrolDetailActions } from "@/components/patrol/patrol-detail-actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PatrolDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const decodedNumber = decodeURIComponent(id);

  const [record] = await db
    .select()
    .from(patrolRecords)
    .where(eq(patrolRecords.number, decodedNumber));

  if (!record) {
    notFound();
  }

  const user = session.user as { name: string; roles: string[] };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/patrol">
            <Button variant="outline" size="icon">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-black">{record.number}</h2>
            <p className="text-sm text-muted-foreground">Detail Catatan Patroli</p>
          </div>
        </div>
        <PatrolDetailActions record={record} userName={user.name} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck size={18} />
              Informasi Patroli
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Calendar size={14} /> Tanggal
                </p>
                <p className="font-bold">{record.patrolDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Clock size={14} /> Waktu
                </p>
                <p className="font-bold">
                  {record.startTime} {record.endTime ? `- ${record.endTime}` : ""}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <User size={14} /> Petugas
                </p>
                <p className="font-bold">{record.officerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin size={14} /> Shift / Area
                </p>
                <p className="font-bold">
                  {record.shift} - {record.area}
                </p>
              </div>
            </div>

            <div className="border-t pt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Checkpoint</p>
                <p className="text-2xl font-black">
                  {record.checkpointDone}/{record.checkpointTotal}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kondisi</p>
                <Badge
                  variant={record.condition === "Normal" ? "secondary" : "destructive"}
                  className="mt-1"
                >
                  {record.condition}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sumber Data</p>
                <p className="text-sm font-semibold mt-1">{record.source}</p>
              </div>
            </div>

            {record.supervisorNote && (
              <div className="border-t pt-4">
                <p className="text-xs font-bold text-muted-foreground">Catatan Supervisor</p>
                <p className="text-sm mt-1 p-2 bg-muted rounded">{record.supervisorNote}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status & Verifikasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Verifikasi Supervisor</p>
              <Badge
                variant={
                  record.verificationStatus === "Terverifikasi" ? "default" : "outline"
                }
                className="mt-1 text-sm"
              >
                {record.verificationStatus}
              </Badge>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Status Sinkronisasi</p>
              <Badge variant="secondary" className="mt-1 text-sm">
                {record.syncStatus}
              </Badge>
            </div>

            {record.googleResponseId && (
              <div>
                <p className="text-xs text-muted-foreground">Google Response ID</p>
                <p className="text-xs font-mono truncate">{record.googleResponseId}</p>
              </div>
            )}

            <div className="border-t pt-4 text-xs text-muted-foreground">
              <p>Dibuat: {new Date(record.createdAt).toLocaleString("id-ID")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
