import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#0E8F68", "#E19F52", "#6B7280", "#10B981", "#F59E0B", "#14B8A6", "#A78BFA", "#F97316"];

export default function DonutChartCard({ categories, totals }) {
  const [showDepense, setShowDepense] = React.useState(true);
  const data = (categories || [])
    .filter(c => (showDepense ? c.kind === "depense" : c.kind === "revenu"))
    .map((c, i) => ({
      name: c.category_name,
      value: Number(c.amount || 0),
      percent: Number(c.percent_of_parent || 0)
    }));

  return (
    <Card className="card-glow border-0">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Répartition par catégories</CardTitle>
        <div className="flex items-center gap-2">
          <Label className="text-sm">{showDepense ? "Dépenses" : "Revenus"}</Label>
          <Switch checked={showDepense} onCheckedChange={setShowDepense} />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                dataKey="value"
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val, name, props) => [`${new Intl.NumberFormat("fr-FR").format(val)} XOF`, props?.payload?.name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}