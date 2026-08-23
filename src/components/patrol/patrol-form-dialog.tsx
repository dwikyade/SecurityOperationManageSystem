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
import { createPatrolRecord } from "@/app/actions/patrol";
import { toast } from "sonner";

type Props = {
  shifts: Array<{ id: number; name: string }>;
  locations: Array<{ code: string; name: string }>;
  officerId: number;
  officerName: string;
};

export function PatrolFormDialog({ shifts, locations, officerId, officerName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = await createPatrolRecord({
        patrolDate: formData.get("patrolDate") as string,
        startTime: formData.get("startTime") as string,
        officerId,
        officerName,
        shift: formData.get("shift") as string,
        area: formData.get("area") as string,
        checkpointTotal: Number(formData.get("checkpointTotal")),
        condition: formData.get("condition") as string,
      });

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
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

  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toTimeString().slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ Catat Patroli</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Catat Patroli Baru</DialogTitle>
          <DialogDescription>
            Isi data patroli keamanan
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input name="patrolDate" type="date" defaultValue={today} required />
            </div>
            <div className="space-y-2">
              <Label>Waktu Mulai</Label>
              <Input name="startTime" type="time" defaultValue={now} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Shift</Label>
            <Select name="shift" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih shift" />
              </SelectTrigger>
              <SelectContent>
                {shifts.map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Area Patroli</Label>
            <Select name="area" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih area" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={l.code} value={l.name}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total Checkpoint</Label>
              <Input
                name="checkpointTotal"
                type="number"
                min="1"
                defaultValue="5"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Kondisi</Label>
              <Select name="condition" required defaultValue="Normal">
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
