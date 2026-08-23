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
import { createFinding } from "@/app/actions/findings";
import { toast } from "sonner";

type Props = {
  departments: Array<{ code: string; name: string }>;
  locations: Array<{ code: string; name: string }>;
  reporterName: string;
};

export function FindingFormDialog({ departments, locations, reporterName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = await createFinding({
        title: formData.get("title") as string,
        foundAt: formData.get("foundAt") as string,
        reporter: reporterName,
        location: formData.get("location") as string,
        category: formData.get("category") as string,
        priority: formData.get("priority") as string,
        ownerDepartment: formData.get("ownerDepartment") as string,
        ownerName: formData.get("ownerName") as string,
        targetResolutionAt: formData.get("targetResolutionAt") as string,
        initialAction: formData.get("initialAction") as string,
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

  const now = new Date().toISOString().slice(0, 16);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ Laporkan Temuan</Button>} />
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Laporkan Temuan Baru</DialogTitle>
          <DialogDescription>
            Catat temuan dari hasil patroli atau inspeksi
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Judul Temuan</Label>
            <Input name="title" placeholder="Deskripsi singkat temuan" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Waktu Ditemukan</Label>
              <Input name="foundAt" type="datetime-local" defaultValue={now} required />
            </div>
            <div className="space-y-2">
              <Label>Lokasi</Label>
              <Select name="location" required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih lokasi" />
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select name="category" required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Keamanan">Keamanan</SelectItem>
                  <SelectItem value="Kebersihan">Kebersihan</SelectItem>
                  <SelectItem value="Fasilitas">Fasilitas</SelectItem>
                  <SelectItem value="K3">K3 (Kesehatan & Keselamatan)</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioritas</Label>
              <Select name="priority" required defaultValue="Sedang">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rendah">Rendah</SelectItem>
                  <SelectItem value="Sedang">Sedang</SelectItem>
                  <SelectItem value="Tinggi">Tinggi</SelectItem>
                  <SelectItem value="Kritis">Kritis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Departemen Penanggungjawab</Label>
              <Select name="ownerDepartment" required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih departemen" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.code} value={d.code}>
                      {d.code} - {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>PIC / Nama Penanggungjawab</Label>
              <Input name="ownerName" placeholder="Nama PIC" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target Penyelesaian</Label>
            <Input name="targetResolutionAt" type="datetime-local" required />
          </div>

          <div className="space-y-2">
            <Label>Tindakan Awal (Opsional)</Label>
            <Textarea
              name="initialAction"
              placeholder="Tindakan yang sudah dilakukan saat menemukan masalah"
              rows={3}
            />
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
