import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PaymentMethodForm({ open, onOpenChange, initialData = null, onSubmit }) {
  const [form, setForm] = React.useState(() => initialData || {
    type: "momo",
    provider_name: "MTN",
    account_number: "",
    status: "active",
  });

  React.useEffect(() => {
    setForm(initialData || { type: "momo", provider_name: "MTN", account_number: "", status: "active" });
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? "Modifier le moyen de paiement" : "Nouveau moyen de paiement"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="momo">Mobile Money</SelectItem>
                <SelectItem value="card">Carte</SelectItem>
                <SelectItem value="bank">Banque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Fournisseur</Label>
            <Select value={form.provider_name} onValueChange={(v) => setForm({ ...form, provider_name: v })}>
              <SelectTrigger><SelectValue placeholder="Fournisseur" /></SelectTrigger>
              <SelectContent>
                {form.type === "momo" && (
                  <>
                    <SelectItem value="MTN">MTN</SelectItem>
                    <SelectItem value="Moov">Moov</SelectItem>
                    <SelectItem value="Celtiis">Celtiis</SelectItem>
                  </>
                )}
                {form.type === "card" && (
                  <>
                    <SelectItem value="Visa">Visa</SelectItem>
                    <SelectItem value="Mastercard">Mastercard</SelectItem>
                    <SelectItem value="Amex">Amex</SelectItem>
                  </>
                )}
                {form.type === "bank" && (
                  <>
                    <SelectItem value="Orabank">Orabank</SelectItem>
                    <SelectItem value="UBA">UBA</SelectItem>
                    <SelectItem value="Ecobank">Ecobank</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>{form.type === "card" ? "Numéro / 4 derniers chiffres" : form.type === "momo" ? "Numéro de téléphone" : "Numéro de compte"}</Label>
            <Input
              value={form.account_number}
              onChange={(e) => setForm({ ...form, account_number: e.target.value })}
              placeholder={form.type === "card" ? "**** **** **** 1234" : form.type === "momo" ? "+229XXXXXXXX" : "000123456789"}
              required
            />
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              {initialData ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}