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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  createDepartment,
  createLocation,
  createVendor,
  createGoodsCategory,
} from "@/app/actions/master-data";
import { createCheckpoint } from "@/app/actions/checkpoints";
import { toast } from "sonner";

export function MasterDataCreateDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("department");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      let result;

      if (activeTab === "department") {
        result = await createDepartment({
          code: formData.get("deptCode") as string,
          name: formData.get("deptName") as string,
          head: formData.get("deptHead") as string,
        });
      } else if (activeTab === "location") {
        result = await createLocation({
          code: formData.get("locCode") as string,
          name: formData.get("locName") as string,
          floor: formData.get("locFloor") as string,
          areaType: formData.get("locAreaType") as string,
        });
      } else if (activeTab === "checkpoint") {
        result = await createCheckpoint({
          code: formData.get("cpCode") as string,
          name: formData.get("cpName") as string,
          locationCode: formData.get("cpLocation") as string,
          floor: formData.get("cpFloor") as string,
          description: formData.get("cpDesc") as string,
          shift: formData.get("cpShift") as string,
          patrolOrder: Number(formData.get("cpOrder")),
          userName: "Admin",
        });
      } else if (activeTab === "vendor") {
        result = await createVendor({
          code: formData.get("vendorCode") as string,
          name: formData.get("vendorName") as string,
          address: formData.get("vendorAddress") as string,
          contact: formData.get("vendorContact") as string,
          email: formData.get("vendorEmail") as string,
          serviceType: formData.get("vendorServiceType") as string,
        });
      } else {
        result = await createGoodsCategory({
          code: formData.get("catCode") as string,
          name: formData.get("catName") as string,
          requiresAssetApproval: formData.get("catAssetApproval") === "on",
          requiresSerialNumber: formData.get("catSerialNumber") === "on",
        });
      }

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ Tambah Data</Button>} />
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Master Data</DialogTitle>
          <DialogDescription>
            Tambah data acuan baru ke sistem
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="department">Dept</TabsTrigger>
            <TabsTrigger value="location">Lokasi</TabsTrigger>
            <TabsTrigger value="checkpoint">CP</TabsTrigger>
            <TabsTrigger value="vendor">Vendor</TabsTrigger>
            <TabsTrigger value="category">Kategori</TabsTrigger>
          </TabsList>

          <form action={handleSubmit} className="space-y-4 mt-4">
            <TabsContent value="department" className="space-y-4">
              <div className="space-y-2">
                <Label>Kode Departemen (Max 20 chars)</Label>
                <Input name="deptCode" placeholder="SEC, ENG, HKG" required />
              </div>
              <div className="space-y-2">
                <Label>Nama Departemen</Label>
                <Input name="deptName" placeholder="Security, Engineering, Housekeeping" required />
              </div>
              <div className="space-y-2">
                <Label>Kepala Departemen</Label>
                <Input name="deptHead" placeholder="Nama kepala departemen" required />
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              <div className="space-y-2">
                <Label>Kode Lokasi (Max 20 chars)</Label>
                <Input name="locCode" placeholder="LOC-LBY, LOC-B1" required />
              </div>
              <div className="space-y-2">
                <Label>Nama Lokasi</Label>
                <Input name="locName" placeholder="Lobby Utama, Basement B1" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lantai</Label>
                  <Input name="locFloor" placeholder="GF, B1, 1-10" required />
                </div>
                <div className="space-y-2">
                  <Label>Tipe Area</Label>
                  <Select name="locAreaType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Publik">Publik</SelectItem>
                      <SelectItem value="Servis">Servis</SelectItem>
                      <SelectItem value="Kamar">Kamar</SelectItem>
                      <SelectItem value="Terbatas">Terbatas</SelectItem>
                      <SelectItem value="Event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="checkpoint" className="space-y-4">
              <div className="space-y-2">
                <Label>Kode Checkpoint (Max 20 chars)</Label>
                <Input name="cpCode" placeholder="CP-LBY-01, CP-RF-01" required />
              </div>
              <div className="space-y-2">
                <Label>Nama Checkpoint</Label>
                <Input name="cpName" placeholder="Pintu Utama Lobby, Area Helipad" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lantai</Label>
                  <Input name="cpFloor" placeholder="GF, RF, B1" required />
                </div>
                <div className="space-y-2">
                  <Label>Shift</Label>
                  <Select name="cpShift" required defaultValue="Pagi">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pagi">Pagi</SelectItem>
                      <SelectItem value="Siang">Siang</SelectItem>
                      <SelectItem value="Malam">Malam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Urutan Patroli</Label>
                <Input name="cpOrder" type="number" min="1" defaultValue="1" required />
              </div>
            </TabsContent>

            <TabsContent value="vendor" className="space-y-4">
              <div className="space-y-2">
                <Label>Kode Vendor (Max 20 chars)</Label>
                <Input name="vendorCode" placeholder="VND-001, VND-SUP" required />
              </div>
              <div className="space-y-2">
                <Label>Nama Vendor</Label>
                <Input name="vendorName" placeholder="PT. ABC Supplier" required />
              </div>
              <div className="space-y-2">
                <Label>Alamat</Label>
                <Textarea name="vendorAddress" placeholder="Alamat lengkap vendor" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kontak</Label>
                  <Input name="vendorContact" placeholder="Nomor telepon" required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="vendorEmail" type="email" placeholder="vendor@example.com" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Jenis Layanan</Label>
                <Input name="vendorServiceType" placeholder="Catering, Maintenance, Supplies" required />
              </div>
            </TabsContent>

            <TabsContent value="category" className="space-y-4">
              <div className="space-y-2">
                <Label>Kode Kategori (Max 20 chars)</Label>
                <Input name="catCode" placeholder="CAT-ELC, CAT-FUR" required />
              </div>
              <div className="space-y-2">
                <Label>Nama Kategori</Label>
                <Input name="catName" placeholder="Elektronik, Furniture, Perlengkapan" required />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="catAssetApproval"
                    name="catAssetApproval"
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="catAssetApproval" className="cursor-pointer">
                    Wajib Approval Aset
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="catSerialNumber"
                    name="catSerialNumber"
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="catSerialNumber" className="cursor-pointer">
                    Wajib Serial Number
                  </Label>
                </div>
              </div>
            </TabsContent>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
