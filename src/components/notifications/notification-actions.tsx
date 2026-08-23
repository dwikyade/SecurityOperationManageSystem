"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { markAllAsRead } from "@/app/actions/notifications";
import { toast } from "sonner";
import { CheckCheck } from "lucide-react";

export function NotificationActions({ userId }: { userId: number }) {
  const router = useRouter();

  async function handleMarkAll() {
    const result = await markAllAsRead(userId);
    if (result.success) {
      toast.success("Semua notifikasi ditandai telah dibaca");
      router.refresh();
    } else {
      toast.error("Gagal menandai notifikasi");
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleMarkAll}>
      <CheckCheck size={16} />
      Tandai Semua Dibaca
    </Button>
  );
}
