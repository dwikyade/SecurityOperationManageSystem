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
import { updateFindingProgress, deleteFinding } from "@/app/actions/crud-ops";
import { toast } from "sonner";
import { RefreshCw, Trash2 } from "lucide-react";

type Finding = {
  number: string;
  progress: number;
  status: string;
  closingNote: string | null;
};

type Props = {
  finding: Finding;
  userName: string;
};

export function FindingDetailActions({ finding, userName }: Props) {
  const router = useRouter();
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUpdate(formData: FormData) {
    setLoading(true);
    try {
      const progress = Number(formData.get("progress"));
      const status = formData.get("status") as string;
      const note = formData.get("closingNote") as string;

      const result = await updateFindingProgress(
        finding.number,
        progress,
        status,
        note,
        userName
      );

      if (result.success) {
        toast.success(result.message);
        setUpdateOpen(false);
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
      const result = await deleteFinding(finding.number, userName);
      if (result.success) {
        toast.success(result.message);
        setDeleteOpen(false);
        router.push("/findings");
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
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogTrigger
          render={
            <Button variant="outline" size="sm">
              <RefreshCw size={16} /> Update Progress
            </Button>
          }
        />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Progress Temuan</DialogTitle>
            <DialogDescription>{finding.number}</DialogDescription>
          </DialogHeader>

          <form action={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>Progress (%)</Label>
              <Input
                name="progress"
                type="number"
                min="0"
                max="100"
                defaultValue={finding.progress}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select name="status" defaultValue={finding.status} required>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baru Dilaporkan">Baru Dilaporkan</SelectItem>
                  <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                  <SelectItem value="Menunggu Material">Menunggu Material</SelectItem>
                  <SelectItem value="Selesai">Selesai</SelectItem>
                  <SelectItem value="Ditutup">Ditutup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Catatan Penutupan / Update</Label>
              <Textarea
                name="closingNote"
                defaultValue={finding.closingNote || ""}
                placeholder="Catatan hasil penanganan temuan"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUpdateOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Update"}
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
            <DialogTitle>Hapus Data Temuan?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Temuan {finding.number} akan dihapus secara permanen.
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
