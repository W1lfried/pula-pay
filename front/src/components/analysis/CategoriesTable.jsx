import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Plus } from "lucide-react";

export default function CategoriesTable({ items, month, onCreate, onUpdate, onDelete }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({ kind: "depense", category_name: "", amount: 0, notes: "" });

  const openNew = () => { setEditing(null); setForm({ kind: "depense", category_name: "", amount: 0, notes: "" }); setOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ kind: item.kind, category_name: item.category_name, amount: item.amount, notes: item.notes || "" }); setOpen(true); };

  const handleSubmit = async () => {
    const payload = { ...form, analysis_month: month, amount: Number(form.amount || 0) };
    if (editing) await onUpdate(editing, payload);
    else await onCreate(payload);
    setOpen(false);
  };

  return (
    <Card className="card-glow border-0">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Catégories du mois</CardTitle>
        <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Ajouter</Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50">
                <TableHead>Catégorie</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>% du total</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(items || []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.category_name}</TableCell>
                  <TableCell>{c.kind}</TableCell>
                  <TableCell className="font-medium">{new Intl.NumberFormat("fr-FR").format(c.amount)} XOF</TableCell>
                  <TableCell>{(Number(c.percent_of_parent || 0)).toFixed(1)}%</TableCell>
                  <TableCell className="text-neutral-500">{c.notes}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => openEdit(c)} className="mr-2"><Edit className="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => onDelete(c)} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!items || items.length === 0) && (
                <TableRow><TableCell colSpan={6} className="text-center text-neutral-500 py-6">Aucune catégorie pour ce mois</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="depense">Dépense</SelectItem>
                  <SelectItem value="revenu">Revenu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Catégorie</Label>
              <Input value={form.category_name} onChange={(e) => setForm({ ...form, category_name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Montant (XOF)</Label>
              <Input type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={handleSubmit}>{editing ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}