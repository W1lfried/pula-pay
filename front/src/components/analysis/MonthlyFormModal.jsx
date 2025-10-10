import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function MonthlyFormModal({ open, onOpenChange, initial, onSubmit }) {
  const [form, setForm] = React.useState(initial || { month: "", revenue_total: 0, expense_total: 0, currency: "XOF", notes: "" });

  React.useEffect(() => {
    setForm(initial || { month: "", revenue_total: 0, expense_total: 0, currency: "XOF", notes: "" });
  }, [initial, open]);

  const savings = Number(form.revenue_total || 0) - Number(form.expense_total || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Modifier le mois" : "Nouveau mois"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Mois (YYYY-MM)</Label>
            <Input placeholder="2025-07" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Revenus (XOF)</Label>
              <Input type="number" min="0" value={form.revenue_total} onChange={e => setForm({ ...form, revenue_total: Number(e.target.value || 0) })} />
            </div>
            <div className="grid gap-2">
              <Label>Dépenses (XOF)</Label>
              <Input type="number" min="0" value={form.expense_total} onChange={e => setForm({ ...form, expense_total: Number(e.target.value || 0) })} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Devise</Label>
              <Input value={form.currency || "XOF"} onChange={e => setForm({ ...form, currency: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Économies (auto)</Label>
              <Input value={new Intl.NumberFormat("fr-FR").format(savings)} disabled />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={() => onSubmit({ ...form, savings_total: savings })}>
            {initial ? "Enregistrer" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}