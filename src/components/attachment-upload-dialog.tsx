"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createAttachment } from "@/app/actions/attachments";
import { toast } from "sonner";
import { Paperclip, Image as ImageIcon } from "lucide-react";

type Props = {
  module: string;
  referenceNumber: string;
  uploader: string;
};

export function AttachmentUploadDialog({ module, referenceNumber, uploader }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const url = formData.get("url") as string;
      const fileName = formData.get("fileName") as string;

      if (!url || !fileName) {
        toast.error("URL dan Nama File wajib diisi");
        setLoading(false);
        return;
      }

      const result = await createAttachment({
        module,
        referenceNumber,
        url,
        fileName,
        fileType: url.match(/\.(jpg|jpeg|png|gif|webp)/i) ? "image" : "document",
        fileSize: 1024,
        uploader,
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
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Paperclip size={16} /> Lampiran / Foto
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Lampiran / Foto Bukti</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama File / Keterangan Foto</label>
            <Input name="fileName" placeholder="Foto Kerusakan, Foto Surat Jalan" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">URL Gambar / Dokumen</label>
            <Input name="url" placeholder="https://..." required />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Lampiran"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
