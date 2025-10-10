import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function LineChartCard({ series }) {
  const data = (series || []).map(m => ({
    month: m.month,
    revenue_total: Number(m.revenue_total || 0),
    expense_total: Number(m.expense_total || 0),
    savings_total: Number(m.savings_total || 0)
  }));

  return (
    <Card className="card-glow border-0">
      <CardHeader>
        <CardTitle>Évolution 12–24 mois</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue_total" stroke="#0E8F68" dot={false} name="Revenus" />
              <Line type="monotone" dataKey="expense_total" stroke="#E19F52" dot={false} name="Dépenses" />
              <Line type="monotone" dataKey="savings_total" stroke="#64748B" dot={false} name="Économies" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}