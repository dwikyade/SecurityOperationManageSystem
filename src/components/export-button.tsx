"use client";

import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";

type Props = {
  href: string;
  label?: string;
};

export function ExportButton({ href, label = "Export Excel" }: Props) {
  function handleClick() {
    window.open(href, "_blank");
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <FileSpreadsheet size={16} />
      {label}
    </Button>
  );
}
