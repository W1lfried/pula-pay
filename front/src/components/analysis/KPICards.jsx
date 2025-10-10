import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function KPICards({ data }) {
  const formatXOF = (n) => `${new Intl.NumberFormat("fr-FR").format(Number(n || 0))} XOF`;
  const positive = Number(data?.savings_total || 0) >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="card-glow border-0">
        <CardContent className="p-6">
          <p className="text-sm text-neutral-500">Revenus</p>
          <p className="text-2xl font-bold">{formatXOF(data?.revenue_total)}</p>
        </CardContent>
      </Card>
      <Card className="card-glow border-0">
        <CardContent className="p-6">
          <p className="text-sm text-neutral-500">Dépenses</p>
          <p className="text-2xl font-bold">{formatXOF(data?.expense_total)}</p>
        </CardContent>
      </Card>
      <Card className={`card-glow border-0 ${positive ? "ring-1 ring-emerald-100" : "ring-1 ring-red-100"}`}>
        <CardContent className="p-6">
          <p className="text-sm text-neutral-500">Économies</p>
          <p className={`text-2xl font-bold ${positive ? "text-emerald-600" : "text-red-600"}`}>{formatXOF(data?.savings_total)}</p>
        </CardContent>
      </Card>
    </div>
  );
}