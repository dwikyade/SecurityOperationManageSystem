"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type GatePassData = {
  number: string;
  token: string;
  status: string;
  requester: string;
  bearer: string;
  department: string;
  purpose: string;
  movementType: string;
  validFrom: string;
  validUntil: string;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    assetCode: string;
  }>;
};

type Props = {
  data: GatePassData;
};

export function GatePassDisplay({ data }: Props) {
  const statusVariant = (s: string) => {
    switch (s) {
      case "Aktif": return "default" as const;
      case "Digunakan": return "secondary" as const;
      case "Kadaluarsa": return "destructive" as const;
      default: return "outline" as const;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Gate Pass</span>
          <Badge variant={statusVariant(data.status)}>{data.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Nomor Gate Pass</p>
          <p className="font-mono text-lg font-bold">{data.number}</p>
        </div>

        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">Token QR</p>
          <p className="font-mono text-xl font-bold break-all">{data.token}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Pemohon</p>
            <p className="font-medium">{data.requester}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Pembawa</p>
            <p className="font-medium">{data.bearer}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Departemen</p>
            <p className="font-medium">{data.department}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tipe Pergerakan</p>
            <p className="font-medium">{data.movementType}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Tujuan</p>
          <p className="text-sm">{data.purpose}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Berlaku Dari</p>
            <p className="font-medium">{new Date(data.validFrom).toLocaleString("id-ID")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Berlaku Sampai</p>
            <p className="font-medium">{new Date(data.validUntil).toLocaleString("id-ID")}</p>
          </div>
        </div>

        {data.items.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Barang</p>
            <div className="space-y-2">
              {data.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm border-b pb-1">
                  <span>{item.name}</span>
                  <span className="text-muted-foreground">
                    {item.quantity} {item.unit}
                    {item.assetCode && ` (${item.assetCode})`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
