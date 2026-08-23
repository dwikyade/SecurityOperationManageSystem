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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { syncPatrolFromGoogleSheets } from "@/app/actions/google-sheets";
import { toast } from "sonner";

type Props = {
  configs: Array<{
    id: number;
    name: string;
    spreadsheetUrl: string;
    spreadsheetId: string;
    sheetName: string;
    lastSyncAt: Date | null;
    lastSyncRowCount: number | null;
    status: string;
  }>;
  userName: string;
};

export function GoogleSheetsSyncDialog({ configs, userName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState<string>("");

  async function handleSync() {
    if (!selectedConfigId) {
      toast.error("Pilih konfigurasi sync");
      return;
    }

    setLoading(true);
    try {
      const result = await syncPatrolFromGoogleSheets(
        Number(selectedConfigId),
        userName
      );

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Terjadi kesalahan saat sinkronisasi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Sinkron dari Google Sheets</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sinkronisasi dari Google Sheets</DialogTitle>
          <DialogDescription>
            Ambil data patroli dari Google Spreadsheet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Pilih Konfigurasi</Label>
            <Select
              value={selectedConfigId}
              onValueChange={(value) => setSelectedConfigId(value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih spreadsheet" />
              </SelectTrigger>
              <SelectContent>
                {configs.map((config) => (
                  <SelectItem key={config.id} value={String(config.id)}>
                    {config.name} - {config.status === "Aktif" ? "✓" : "✗"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedConfigId && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium">
                {configs.find(c => c.id === Number(selectedConfigId))?.spreadsheetUrl}
              </p>
              <p className="text-muted-foreground">
                Sheet: {configs.find(c => c.id === Number(selectedConfigId))?.sheetName || "Sheet1"}
              </p>
              {configs.find(c => c.id === Number(selectedConfigId))?.lastSyncAt && (
                <p className="text-muted-foreground">
                  Terakhir sync: {new Date(
                    configs.find(c => c.id === Number(selectedConfigId))!.lastSyncAt!
                  ).toLocaleString("id-ID")}
                </p>
              )}
            </div>
          )}

          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
            <p className="font-medium text-yellow-800 dark:text-yellow-200">⚠️ Catatan:</p>
            <ul className="text-yellow-700 dark:text-yellow-300 text-xs mt-1 space-y-1">
              <li>• Data akan disinkronisasi sebagai catatan patroli baru</li>
              <li>• Pastikan format kolom sesuai dengan konfigurasi mapping</li>
              <li>• Duplikat data akan ditandai dengan status "Tersinkron"</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleSync} disabled={loading || !selectedConfigId}>
            {loading ? "Menyinkronkan..." : "Sinkron Sekarang"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
