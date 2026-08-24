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
import { createApprovalFlow } from "@/app/actions/approval-flows";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

type Props = {
  roles: Array<{ id: number; name: string }>;
  userName: string;
};

export function ApprovalFlowDialog({ roles, userName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<Array<{ stepOrder: number; roleName: string }>>([
    { stepOrder: 1, roleName: roles[0]?.name || "" },
  ]);

  function addStep() {
    setSteps((prev) => [
      ...prev,
      { stepOrder: prev.length + 1, roleName: roles[0]?.name || "" },
    ]);
  }

  function removeStep(index: number) {
    if (steps.length <= 1) return;
    setSteps((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, stepOrder: i + 1 }))
    );
  }

  function updateStepRole(index: number, roleName: string) {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, roleName } : step))
    );
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = await createApprovalFlow({
        name: formData.get("flowName") as string,
        transactionType: formData.get("transactionType") as string,
        steps,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ Buat Approval Flow</Button>} />
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Workflow Approval Baru</DialogTitle>
          <DialogDescription>
            Konfigurasi alur persetujuan bertingkat dinamis
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Flow</Label>
            <Input name="flowName" placeholder="Approval Barang Aset" required />
          </div>

          <div className="space-y-2">
            <Label>Tipe Transaksi</Label>
            <Select name="transactionType" required defaultValue="Barang Aset">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Barang Aset">Barang Aset (High Risk)</SelectItem>
                <SelectItem value="Barang Non-Aset">Barang Non-Aset (Low Risk)</SelectItem>
                <SelectItem value="Barang Tamu">Barang Tamu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tahap Approval ({steps.length})</Label>
              <Button type="button" variant="outline" size="sm" onClick={addStep}>
                <Plus size={14} /> Tambah Tahap
              </Button>
            </div>

            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 border p-2 rounded-lg">
                  <span className="font-bold text-xs w-16">Tahap {step.stepOrder}</span>
                  <Select
                    value={step.roleName}
                    onValueChange={(val) => updateStepRole(idx, val ?? "")}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={r.name}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {steps.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeStep(idx)}
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Flow"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
