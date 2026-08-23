"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QrCode, Printer } from "lucide-react";

type Props = {
  checkpoint: {
    code: string;
    name: string;
    floor: string;
    shift: string;
    qrToken: string;
  };
};

export function CheckpointQrDialog({ checkpoint }: Props) {
  const [open, setOpen] = useState(false);

  function handlePrint() {
    window.print();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <QrCode size={16} /> QR Code
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle>QR Code Checkpoint</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 border rounded-xl bg-card p-6 print:border-none">
          <div>
            <h3 className="text-xl font-black">{checkpoint.name}</h3>
            <p className="text-sm text-muted-foreground">
              {checkpoint.code} | Lantai {checkpoint.floor} | Shift {checkpoint.shift}
            </p>
          </div>

          <div className="flex justify-center p-6 bg-white rounded-lg border w-48 h-48 mx-auto items-center">
            <div className="text-center space-y-2">
              <QrCode size={96} className="mx-auto text-black" />
              <p className="font-mono text-[10px] text-black break-all">{checkpoint.qrToken}</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Tempelkan QR Code ini di area checkpoint untuk di-scan oleh petugas patroli.
          </p>
        </div>

        <div className="flex justify-end gap-2 print:hidden">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Tutup
          </Button>
          <Button onClick={handlePrint}>
            <Printer size={16} /> Cetak QR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
