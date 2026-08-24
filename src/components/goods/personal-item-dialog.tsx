"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createPersonalItem } from "@/app/actions/personal-items";
import { toast } from "sonner";
import { UserCheck } from "lucide-react";

type Props = {
  departments: Array<{ code: string; name: string }>;
  securityUsers: Array<{ id: number; name: string }>;
  userName: string;
};

export function PersonalItemDialog({ departments, securityUsers, userName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = await createPersonalItem({
        ownerName: formData.get("ownerName") as string,
        ownerIdentity: formData.get("ownerIdentity") as string,
        department: formData.get("department") as string,
        itemName: formData.get("itemName") as string,
        brand: formData.get("brand") as string,
        model: formData.get("model") as string,
        serialNumber: formData.get("serialNumber") as string,
        color: formData.get("color") as string,
        enteredAt: formData.get("enteredAt") as string,
        securityChecker: formData.get("securityChecker") as string,
        userName,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <UserCheck size={16} /> Barang Pribadi
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Catat Barang Pribadi</DialogTitle>
          <DialogDescription>
            Pencatatan barang bawaan pribadi karyawan/vendor/tamu
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Pemilik</Label>
              <Input name="ownerName" placeholder="Nama pemilik" required />
            </div>
            <div className="space-y-2">
              <Label>No. Identitas (KTP/SIM/Karyawan)</Label>
              <Input name="ownerIdentity" placeholder="No. ID" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Departemen / Perusahaan</Label>
              <Select name="department" required>
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
              <Label>Nama Barang</Label>
              <Input name="itemName" placeholder="Laptop, Kamera, Toolset" required />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label>Merek</Label>
              <Input name="brand" placeholder="Asus, Sony" />
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Input name="model" placeholder="ROG, Alpha" />
            </div>
            <div className="space-y-2">
              <Label>Warna</Label>
              <Input name="color" placeholder="Hitam, Perak" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Serial Number</Label>
            <Input name="serialNumber" placeholder="S/N barang" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Masuk</Label>
              <Input name="enteredAt" type="date" defaultValue={today} required />
            </div>
            <div className="space-y-2">
              <Label>Security Checker</Label>
              <Select name="securityChecker" required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih security" />
                </SelectTrigger>
                <SelectContent>
                  {securityUsers.map((u) => (
                    <SelectItem key={u.id} value={u.name}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Barang Pribadi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
