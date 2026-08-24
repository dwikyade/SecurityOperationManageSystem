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
import { createGoodsReturn } from "@/app/actions/goods-return";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";

type Props = {
  gatePasses: Array<{ number: string; bearer: string; department: string }>;
  securityUsers: Array<{ id: number; name: string }>;
  userName: string;
};

export function GoodsReturnDialog({ gatePasses, securityUsers, userName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const gatePassNumber = formData.get("gatePassNumber") as string;
      const gatePass = gatePasses.find((g) => g.number === gatePassNumber);

      const result = await createGoodsReturn({
        gatePassNumber,
        returnedAt: formData.get("returnedAt") as string,
        securityChecker: formData.get("securityChecker") as string,
        carrierName: gatePass?.bearer || (formData.get("carrierName") as string),
        returnedSummary: formData.get("returnedSummary") as string,
        returnCondition: formData.get("returnCondition") as string,
        notes: formData.get("notes") as string,
        items: [
          {
            itemName: formData.get("itemName") as string,
            quantityReturned: Number(formData.get("quantityReturned")),
            conditionOnReturn: formData.get("returnCondition") as string,
          },
        ],
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
            <RotateCcw size={16} /> Catat Pengembalian
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Catat Pengembalian Barang</DialogTitle>
          <DialogDescription>
            Pencatatan pengembalian barang keluar (Return Tracking)
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Gate Pass Terkait</Label>
            <Select name="gatePassNumber" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Gate Pass" />
              </SelectTrigger>
              <SelectContent>
                {gatePasses.map((gp) => (
                  <SelectItem key={gp.number} value={gp.number}>
                    {gp.number} - {gp.bearer} ({gp.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Kembali</Label>
              <Input name="returnedAt" type="date" defaultValue={today} required />
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

          <div className="space-y-2">
            <Label>Ringkasan Barang Kembali</Label>
            <Input name="returnedSummary" placeholder="Ringkasan barang yang dikembalikan" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Barang Item</Label>
              <Input name="itemName" placeholder="Nama barang" required />
            </div>
            <div className="space-y-2">
              <Label>Jumlah Dikembalikan</Label>
              <Input name="quantityReturned" type="number" min="1" defaultValue="1" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Kondisi Pengembalian</Label>
            <Select name="returnCondition" defaultValue="Baik" required>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Baik">Baik / Utuh</SelectItem>
                <SelectItem value="Rusak Ringan">Rusak Ringan</SelectItem>
                <SelectItem value="Rusak Berat">Rusak Berat</SelectItem>
                <SelectItem value="Hilang Sebagian">Hilang Sebagian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Catatan Tambahan</Label>
            <Textarea name="notes" placeholder="Catatan kondisi atau kelengkapan" rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Pengembalian"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
