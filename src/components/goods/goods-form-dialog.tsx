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
import { createOutgoingGoods } from "@/app/actions/outgoing";
import { createIncomingGoods } from "@/app/actions/goods";
import { toast } from "sonner";

type Props = {
  type: "incoming" | "outgoing";
  departments: Array<{ code: string; name: string }>;
  securityUsers: Array<{ id: number; name: string }>;
};

export function GoodsFormDialog({ type, departments, securityUsers }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itemCount, setItemCount] = useState(1);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      if (type === "incoming") {
        const items = [];
        for (let i = 1; i <= itemCount; i++) {
          const name = formData.get(`itemName_${i}`) as string;
          if (!name) continue;
          items.push({
            name,
            category: formData.get(`itemCategory_${i}`) as string,
            quantity: Number(formData.get(`itemQuantity_${i}`)),
            unit: formData.get(`itemUnit_${i}`) as string,
            condition: formData.get(`itemCondition_${i}`) as string,
            serialNumber: formData.get(`itemSerial_${i}`) as string,
            assetCode: formData.get(`itemAsset_${i}`) as string,
          });
        }

        const result = await createIncomingGoods({
          receivedAt: formData.get("receivedAt") as string,
          carrierName: formData.get("carrierName") as string,
          carrierType: formData.get("carrierType") as string,
          vendorName: formData.get("vendorName") as string,
          phone: formData.get("phone") as string,
          vehicleNumber: formData.get("vehicleNumber") as string,
          vehicleType: formData.get("vehicleType") as string,
          department: formData.get("department") as string,
          receiver: formData.get("receiver") as string,
          deliveryNoteNumber: formData.get("deliveryNoteNumber") as string,
          purchaseOrderNumber: formData.get("purchaseOrderNumber") as string,
          securityChecker: formData.get("securityChecker") as string,
          notes: formData.get("notes") as string,
          items,
        });

        if (result.success) {
          toast.success(result.message);
          setOpen(false);
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } else {
        const items = [];
        for (let i = 1; i <= itemCount; i++) {
          const name = formData.get(`itemName_${i}`) as string;
          if (!name) continue;
          items.push({
            name,
            category: formData.get(`itemCategory_${i}`) as string,
            quantity: Number(formData.get(`itemQuantity_${i}`)),
            unit: formData.get(`itemUnit_${i}`) as string,
            conditionBefore: formData.get(`itemCondition_${i}`) as string,
            assetCode: formData.get(`itemAsset_${i}`) as string,
            serialNumber: formData.get(`itemSerial_${i}`) as string,
            ownership: formData.get(`itemOwnership_${i}`) as string,
          });
        }

        const result = await createOutgoingGoods({
          requestedAt: formData.get("requestedAt") as string,
          applicantId: Number(formData.get("applicantId")),
          applicantName: formData.get("applicantName") as string,
          department: formData.get("department") as string,
          movementType: formData.get("movementType") as string,
          purpose: formData.get("purpose") as string,
          reason: formData.get("reason") as string,
          carrierName: formData.get("carrierName") as string,
          carrierIdentity: formData.get("carrierIdentity") as string,
          vehicleNumber: formData.get("vehicleNumber") as string,
          destination: formData.get("destination") as string,
          exitDate: formData.get("exitDate") as string,
          plannedReturnDate: formData.get("plannedReturnDate") as string,
          risk: formData.get("risk") as string,
          items,
        });

        if (result.success) {
          toast.success(result.message);
          setOpen(false);
          router.refresh();
        } else {
          toast.error(result.message);
        }
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
      <DialogTrigger render={<Button>{type === "incoming" ? "+ Catat Barang Masuk" : "+ Ajukan Barang Keluar"}</Button>} />
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{type === "incoming" ? "Catat Barang Masuk" : "Ajukan Barang Keluar"}</DialogTitle>
          <DialogDescription>
            Isi data {type === "incoming" ? "penerimaan barang" : "pengeluaran barang"}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {type === "incoming" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal Terima</Label>
                  <Input name="receivedAt" type="date" defaultValue={today} required />
                </div>
                <div className="space-y-2">
                  <Label>Kendaraan</Label>
                  <Input name="carrierName" placeholder="Nama kendaraan" required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tipe Kendaraan</Label>
                  <Input name="carrierType" placeholder="Truk/Mobil/Motor" />
                </div>
                <div className="space-y-2">
                  <Label>No. Polisi</Label>
                  <Input name="vehicleNumber" placeholder="ABC123" />
                </div>
                <div className="space-y-2">
                  <Label>Tipe Kendaraan</Label>
                  <Input name="vehicleType" placeholder="Box/Tanki" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vendor</Label>
                  <Input name="vendorName" placeholder="Nama vendor" />
                </div>
                <div className="space-y-2">
                  <Label>No. Kontak</Label>
                  <Input name="phone" placeholder="0812..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Departemen</Label>
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
                  <Label>Penerima</Label>
                  <Input name="receiver" placeholder="Nama penerima" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>No. Surat Jalan</Label>
                  <Input name="deliveryNoteNumber" placeholder="SJ-..." />
                </div>
                <div className="space-y-2">
                  <Label>No. PO</Label>
                  <Input name="purchaseOrderNumber" placeholder="PO-..." />
                </div>
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

              <div className="space-y-2">
                <Label>Catatan</Label>
                <Textarea name="notes" placeholder="Catatan tambahan" />
              </div>

              <div className="space-y-2">
                <Label>Item (Max 5)</Label>
                <Input
                  name="itemCount"
                  type="number"
                  min="1"
                  max="5"
                  defaultValue="1"
                  onChange={(e) => setItemCount(Math.min(5, Math.max(1, Number(e.target.value))))}
                />
                <div className="space-y-2">
                  {Array.from({ length: itemCount }).map((_, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2 border p-2 rounded-lg">
                      <div className="col-span-2">
                        <Input
                          name={`itemName_${i + 1}`}
                          placeholder={`Nama barang ${i + 1}`}
                          required
                        />
                      </div>
                      <Input
                        name={`itemCategory_${i + 1}`}
                        placeholder="Kategori"
                      />
                      <div className="flex gap-2">
                        <Input
                          name={`itemQuantity_${i + 1}`}
                          type="number"
                          min="1"
                          defaultValue="1"
                          className="w-20"
                        />
                        <Input
                          name={`itemUnit_${i + 1}`}
                          placeholder="Unit (pcs/kg/ltr)"
                        />
                      </div>
                      <Input
                        name={`itemCondition_${i + 1}`}
                        placeholder="Kondisi (Baik/Rusak)"
                        defaultValue="Baik"
                      />
                      <div className="col-span-2 grid grid-cols-2 gap-2">
                        <Input
                          name={`itemSerial_${i + 1}`}
                          placeholder="Serial Number"
                        />
                        <Input
                          name={`itemAsset_${i + 1}`}
                          placeholder="Asset Code"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal Permintaan</Label>
                  <Input name="requestedAt" type="date" defaultValue={today} required />
                </div>
                <div className="space-y-2">
                  <Label>Waktu Keluar</Label>
                  <Input name="exitDate" type="date" defaultValue={today} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Applicant</Label>
                <Select name="applicantId" required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih applicant" />
                  </SelectTrigger>
                  <SelectContent>
                    {securityUsers.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Departemen</Label>
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
                  <Label>Tipe Pergerakan</Label>
                  <Select name="movementType" required defaultValue="DariHotel">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DariHotel">Dari Hotel</SelectItem>
                      <SelectItem value="KeHotel">Ke Hotel</SelectItem>
                      <SelectItem value="Internal">Internal Hotel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tujuan</Label>
                <Input name="destination" placeholder="Tujuan" required />
              </div>

              <div className="space-y-2">
                <Label>Purpose</Label>
                <Input name="purpose" placeholder="Tujuan penggunaan barang" required />
              </div>

              <div className="space-y-2">
                <Label>Alasan</Label>
                <Textarea name="reason" placeholder="Alasan pengeluaran" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pembawa</Label>
                  <Input name="carrierName" placeholder="Nama pembawa" required />
                </div>
                <div className="space-y-2">
                  <Label>ID Card / Identity</Label>
                  <Input name="carrierIdentity" placeholder="KTP/SIM" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>No. Kendaraan</Label>
                <Input name="vehicleNumber" placeholder="No. polisi" />
              </div>

              <div className="space-y-2">
                <Label>Risiko</Label>
                <Select name="risk" required defaultValue="Non-Aset">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Non-Aset">Non-Aset</SelectItem>
                    <SelectItem value="Aset">Aset</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Item (Max 5)</Label>
                <Input
                  name="itemCount"
                  type="number"
                  min="1"
                  max="5"
                  defaultValue="1"
                  onChange={(e) => setItemCount(Math.min(5, Math.max(1, Number(e.target.value))))}
                />
                <div className="space-y-2">
                  {Array.from({ length: itemCount }).map((_, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2 border p-2 rounded-lg">
                      <div className="col-span-2">
                        <Input
                          name={`itemName_${i + 1}`}
                          placeholder={`Nama barang ${i + 1}`}
                          required
                        />
                      </div>
                      <Input
                        name={`itemCategory_${i + 1}`}
                        placeholder="Kategori"
                      />
                      <div className="flex gap-2">
                        <Input
                          name={`itemQuantity_${i + 1}`}
                          type="number"
                          min="1"
                          defaultValue="1"
                          className="w-20"
                        />
                        <Input
                          name={`itemUnit_${i + 1}`}
                          placeholder="Unit (pcs/kg/ltr)"
                        />
                      </div>
                      <Input
                        name={`itemCondition_${i + 1}`}
                        placeholder="Kondisi Sebelum"
                        defaultValue="Baik"
                      />
                      <div className="col-span-2 grid grid-cols-2 gap-2">
                        <Select name={`itemOwnership_${i + 1}`} required defaultValue="Hotel">
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Hotel">Hotel</SelectItem>
                            <SelectItem value="Tamu">Tamu</SelectItem>
                            <SelectItem value="Vendor">Vendor</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            name={`itemAsset_${i + 1}`}
                            placeholder="Asset Code"
                          />
                          <Input
                            name={`itemSerial_${i + 1}`}
                            placeholder="Serial Number"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rencana Kembali</Label>
                  <Input name="plannedReturnDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Applicant Name</Label>
                  <Input
                    name="applicantName"
                    placeholder="Nama applicant"
                    required
                  />
                </div>
              </div>
            </div>
          )}

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
