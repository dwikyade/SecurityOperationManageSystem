"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  startApprovalWorkflow,
  approveRequest,
  rejectRequest,
} from "@/app/actions/approval";
import { toast } from "sonner";

type ApprovalItem = {
  id: string;
  requestNumber: string;
  requester: string;
  department: string;
  stepName: string;
  itemSummary: string;
  risk: string;
  status: string;
  note: string | null;
  decidedBy: string | null;
  decidedAt: Date | null;
};

type Props = {
  item?: ApprovalItem;
  type: "start" | "approve" | "reject";
  approverName: string;
  buttonText: string;
};

export function ApprovalActionsDialog({ item, type, approverName, buttonText }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      let result;

      if (type === "start" && item) {
        result = await startApprovalWorkflow(
          item.requestNumber,
          item.requester,
          item.department,
          item.risk
        );
      } else if (type === "approve" && item) {
        result = await approveRequest(item.id, approverName, formData.get("note") as string);
      } else if (type === "reject" && item) {
        const reason = formData.get("reason") as string;
        if (!reason) {
          toast.error("Alasan penolakan wajib diisi");
          setLoading(false);
          return;
        }
        result = await rejectRequest(item.id, approverName, reason);
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
    <Button
      variant={type === "approve" ? "default" : type === "reject" ? "destructive" : "outline"}
      size="sm"
    >
      {buttonText}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === "start" && "Mulai Workflow Approval"}
            {type === "approve" && "Setujui Permintaan"}
            {type === "reject" && "Tolak Permintaan"}
          </DialogTitle>
          <DialogDescription>
            {item?.requestNumber} - {item?.requester}
          </DialogDescription>
        </DialogHeader>

        {type === "start" ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Memulai workflow approval untuk permintaan barang keluar ini.
              Sistem akan mengirimkan notifikasi ke tahap approval pertama.
            </p>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-4">
            {type === "approve" && (
              <div className="space-y-2">
                <Label>Catatan (Opsional)</Label>
                <Textarea name="note" placeholder="Catatan persetujuan" rows={3} />
              </div>
            )}
            {type === "reject" && (
              <div className="space-y-2">
                <Label>Alasan Penolakan *</Label>
                <Textarea name="reason" placeholder="Alasan menolak permintaan" rows={3} required />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                variant={type === "reject" ? "destructive" : "default"}
                disabled={loading}
              >
                {loading ? "Memproses..." : type === "approve" ? "Setujui" : "Tolak"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
