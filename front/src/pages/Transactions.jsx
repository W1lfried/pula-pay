
import React, { useEffect, useState } from "react";
import { Transaction } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const typeLabel = {
  recharge_credit: "Recharge crédit",
  recharge_data: "Forfait Internet",
  transfer_money: "Transfert",
  bill_payment: "Facture",
  wallet_topup: "Recharge portefeuille",
  p2p_transfer: "Transfert PulaPay",
  wallet_withdrawal: "Retrait portefeuille"
};

const statusBadge = (status) => {
  switch (status) {
    case "completed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending": return "bg-orange-50 text-orange-700 border-orange-200";
    case "failed": return "bg-red-50 text-red-700 border-red-200";
    default: return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

export default function TransactionsPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true); // NEW

  useEffect(() => { load(); }, []);
  const load = async () => {
    setIsLoading(true);
    const list = await Transaction.list("-created_date", 100);
    setItems(list);
    setIsLoading(false);
  };

  const filtered = items.filter(t => {
    const matchesQ = !q || t.reference?.toLowerCase().includes(q.toLowerCase()) || t.description?.toLowerCase().includes(q.toLowerCase());
    const matchesType = type === "all" || t.type === type;
    const matchesStatus = status === "all" || t.status === status;
    return matchesQ && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Historique des transactions</h1>
          <Button variant="outline" onClick={load} disabled={isLoading}>
            {isLoading ? "Rafraîchissement..." : "Rafraîchir"}
          </Button>
        </div>

        <Card className="card-glow border-0">
          <CardHeader>
            <CardTitle className="text-lg">Filtrer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <Input placeholder="Référence ou description" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-neutral-400" />
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    {Object.keys(typeLabel).map(k => <SelectItem key={k} value={k}>{typeLabel[k]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-neutral-400" />
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="completed">Validée</SelectItem>
                    <SelectItem value="failed">Échouée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="w-full py-16 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-neutral-50">
                      <TableHead>Référence</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Opérateur</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="font-mono text-xs">{t.reference}</TableCell>
                        <TableCell>{typeLabel[t.type] || t.type}</TableCell>
                        <TableCell>{t.operator}</TableCell>
                        <TableCell className="font-medium">{new Intl.NumberFormat('fr-FR').format(t.amount)} XOF</TableCell>
                        <TableCell><Badge className={`${statusBadge(t.status)} border`}>{t.status}</Badge></TableCell>
                        <TableCell>{new Date(t.created_date).toLocaleString("fr-FR")}</TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-neutral-500 py-6">Aucune transaction</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
