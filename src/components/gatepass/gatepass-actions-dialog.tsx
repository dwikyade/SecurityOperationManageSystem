"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { generateGatePass, scanGatePass } from "@/app/actions/gatepass";
import { toast } from "sonner";

type Props = {
  type: "generate" | "scan";
  outgoingNumber?: string;
  approverName?: string;
};

export function GatePassActionsDialog({ type, outgoingNumber, approverName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      let result;

      if (type === "generate" && outgoingNumber && approverName) {
        result = await generateGatePass(outgoingNumber, approverName);
      } else if (type === "scan") {
        const token = formData.get("token") as string;
        if (!token) {
          toast.error("Token wajib diisi");
          setLoading(false);
          return;
        }
        result = await scanGatePass(token, approverName || "System");
      }

      if (result?.success) {
        toast.success(result.message);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result?.message || "Gagal");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  const trigger = (
    <Button variant={type === "generate" ? "default" : "outline"} size="sm">
      {type === "generate" ? "Buat Gate Pass" : "Scan QR"}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === "generate" ? "Buat Gate Pass" : "Scan Gate Pass"}
          </DialogTitle>
          <DialogDescription>
            {type === "generate"
              ? "Buat surat jalan baru untuk barang"
              : "Verifikasi Gate Pass dengan scan QR"}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          {type === "scan" && (
            <div className="space-y-2">
              <Label>Token Gate Pass</Label>
              <Input
                name="token"
                placeholder="Masukkan token atau scan QR"
                required
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Memproses..." : type === "generate" ? "Buat" : "Verifikasi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
