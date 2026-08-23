"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updatePatrolCondition, deletePatrolRecord } from "@/app/actions/crud-ops";
import { toast } from "sonner";
import { CheckCircle2, Trash2 } from "lucide-react";

type Record = {
  number: string;
  condition: string;
  supervisorNote: string | null;
  verificationStatus: string;
};

type Props = {
  record: Record;
  userName: string;
};

export function PatrolDetailActions({ record, userName }: Props) {
  const router = useRouter();
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleVerify(formData: FormData) {
    setLoading(true);
    try {
      const condition = formData.get("condition") as string;
      const note = formData.get("note") as string;

      const result = await updatePatrolCondition(
        record.number,
        condition,
        note,
        userName
      );

      if (result.success) {
        toast.success(result.message);
        setVerifyOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      const result = await deletePatrolRecord(record.number, userName);
      if (result.success) {
        toast.success(result.message);
        setDeleteOpen(false);
        router.push("/patrol");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogTrigger
          render={
            <Button variant="outline" size="sm">
              <CheckCircle2 size={16} /> Verifikasi
            </Button>
          }
        />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verifikasi Patroli</DialogTitle>
            <DialogDescription>{record.number}</DialogDescription>
          </DialogHeader>

          <form action={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label>Kondisi</Label>
              <Select name="condition" defaultValue={record.condition} required>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Ada Temuan">Ada Temuan</SelectItem>
                  <SelectItem value="Darurat">Darurat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Catatan Supervisor</Label>
              <Textarea
                name="note"
                defaultValue={record.supervisorNote || ""}
                placeholder="Catatan verifikasi supervisor"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setVerifyOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Verifikasi..." : "Verifikasi & Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger
          render={
            <Button variant="destructive" size="sm">
              <Trash2 size={16} /> Hapus
            </Button>
          }
        />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Catatan Patroli?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Catatan {record.number} akan dihapus secara permanen.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Batal
            </Button>

            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Menghapus..." : "Hapus Permanen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
