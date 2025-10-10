import React, { useEffect, useState } from "react";
import { User, Transaction } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { callBackendFunction } from "@/components/backend";
import { ArrowLeft, Wallet, Smartphone, CreditCard, CheckCircle, Loader2, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Withdraw() {
  const [me, setMe] = useState(null);
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("mobile_money"); // mobile_money | card
  const [operator, setOperator] = useState("MTN"); // for mobile_money
  const [phone, setPhone] = useState("");
  const [cardBrand, setCardBrand] = useState("Visa");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [callBackend, setCallBackend] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [createdTx, setCreatedTx] = useState(null);
  const [verificationId, setVerificationId] = useState(null);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    load();
  }, []);
  const load = async () => {
    const u = await User.me();
    setMe(u);
    if (u?.phone) setPhone(u.phone);
  };

  const reference = () => `PLA${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0,14)}`;

  const fee = () => {
    const amt = Number(amount || 0);
    // Exemple: 1% de frais, min 100 XOF, max 1500 XOF
    const f = Math.min(Math.max(Math.round(amt * 0.01), 100), 1500);
    return isNaN(f) ? 0 : f;
  };

  const canSubmitStep1 = () => {
    const amt = Number(amount);
    if (!amt || amt < 500) return false;
    if (method === "mobile_money") {
      return Boolean(phone);
    }
    return Boolean(cardName && cardNumber && cardExpiry);
  };

  const handleInitiate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const ref = reference();
    const last4 = method === "card" ? cardNumber.replace(/\s/g, "").slice(-4) : null;

    const tx = await Transaction.create({
      type: "wallet_withdrawal",
      amount: Number(amount),
      status: "pending",
      reference: ref,
      fee: fee(),
      payout_method: method,
      operator: method === "mobile_money" ? operator : undefined,
      recipient_phone: method === "mobile_money" ? phone : undefined,
      destination_card_brand: method === "card" ? cardBrand : undefined,
      destination_card_last4: method === "card" ? last4 : undefined,
      description: method === "mobile_money"
        ? `Retrait → ${operator} ${phone}`
        : `Retrait → ${cardBrand}${last4 ? " • **** " + last4 : ""}`
    });

    let vId = null;
    if (callBackend) {
      const payload = method === "mobile_money"
        ? {
            transaction_id: tx.id,
            method: "mobile_money",
            operator,
            phone,
            amount: Number(amount),
            reference: tx.reference
          }
        : {
            transaction_id: tx.id,
            method: "card",
            card: {
              brand: cardBrand,
              name: cardName,
              number: cardNumber,
              expiry: cardExpiry
            },
            amount: Number(amount),
            reference: tx.reference
          };

      const res = await callBackendFunction("walletWithdrawInitiate", payload);
      // Attendre un verification_id si dispo
      if (res?.ok && res?.data?.verification_id) {
        vId = res.data.verification_id;
      }
    }

    setCreatedTx(tx);
    setVerificationId(vId);
    setSubmitting(false);
    setStep(2);
  };

  const handleVerify = async () => {
    setVerifying(true);
    let ok = true;

    if (callBackend) {
      const res = await callBackendFunction("walletWithdrawVerify", {
        transaction_id: createdTx.id,
        verification_id: verificationId,
        otp
      });
      ok = !!res?.ok;
    }

    await Transaction.update(createdTx.id, { status: ok ? "pending" : "pending" });
    setVerifying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white p-4 md:p-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to={createPageUrl("Wallet")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Demande de retrait</h1>
        </div>

        <Card className="card-glow border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              Retirer depuis votre portefeuille
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Indicateur d'étapes */}
            <div className="flex items-center justify-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? "bg-blue-600 text-white" : "bg-neutral-200 text-neutral-600"}`}>1</div>
              <div className="h-0.5 w-16 bg-neutral-200" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? "bg-blue-600 text-white" : "bg-neutral-200 text-neutral-600"}`}>2</div>
            </div>

            {step === 1 && (
              <form onSubmit={handleInitiate} className="space-y-5">
                <div className="rounded-xl border p-4 bg-neutral-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-500">Solde disponible</p>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat("fr-FR").format(me?.wallet_balance || 0)} XOF
                    </p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Montant à retirer (XOF)</Label>
                  <Input
                    type="number"
                    min="500"
                    step="100"
                    placeholder="Ex: 5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <p className="text-xs text-neutral-500">
                    Frais estimés: {new Intl.NumberFormat("fr-FR").format(fee())} XOF
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label>Moyen de paiement</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="card">Carte bancaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {method === "mobile_money" && (
                  <div className="space-y-4 rounded-xl border p-4">
                    <div className="grid gap-2">
                      <Label>Compte Mobile Money</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Select value={operator} onValueChange={setOperator}>
                          <SelectTrigger><SelectValue placeholder="Opérateur" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MTN">MTN</SelectItem>
                            <SelectItem value="Moov">Moov</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="relative">
                          <Smartphone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <Input className="pl-9" placeholder="+229XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {method === "card" && (
                  <div className="space-y-4 rounded-xl border p-4">
                    <div className="grid gap-2">
                      <Label>Marque de la carte</Label>
                      <Select value={cardBrand} onValueChange={setCardBrand}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Visa">Visa</SelectItem>
                          <SelectItem value="Mastercard">Mastercard</SelectItem>
                          <SelectItem value="Amex">American Express</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Nom du titulaire</Label>
                      <Input placeholder="Ex: Kossi Dossa" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Numéro de carte</Label>
                      <Input placeholder="4242 4242 4242 4242" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label>Expiration (MM/AA)</Label>
                        <Input placeholder="MM/AA" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label>CVC</Label>
                        <Input placeholder="123" inputMode="numeric" maxLength={4} />
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 flex items-center gap-2">
                      <Info className="w-3 h-3" />
                      Les données de carte ne sont pas stockées; elles sont envoyées au backend sécurisé uniquement si activé.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between rounded-xl border p-3">
                  <div>
                    <p className="text-sm font-medium">Appeler le backend</p>
                    <p className="text-xs text-neutral-500">Initie le retrait et envoie l’OTP de vérification si nécessaire</p>
                  </div>
                  <Switch checked={callBackend} onCheckedChange={setCallBackend} />
                </div>

                <Button type="submit" disabled={submitting || !canSubmitStep1()} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi...</> : "Continuer"}
                </Button>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="rounded-xl border p-4 bg-neutral-50">
                  <p className="text-sm text-neutral-600">
                    Saisissez le code OTP reçu pour valider votre retrait.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-neutral-500">Montant</div>
                  <div className="font-medium">{new Intl.NumberFormat("fr-FR").format(Number(amount))} XOF</div>
                  <div className="text-neutral-500">Frais estimés</div>
                  <div className="font-medium">{new Intl.NumberFormat("fr-FR").format(fee())} XOF</div>
                  <div className="text-neutral-500">Référence</div>
                  <div className="font-mono">{createdTx?.reference}</div>
                  <div className="text-neutral-500">Statut</div>
                  <div><Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">pending</Badge></div>
                </div>

                <div className="grid gap-2">
                  <Label>Code de vérification (OTP)</Label>
                  <Input placeholder="******" value={otp} onChange={(e) => setOtp(e.target.value)} />
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setStep(1)} variant="outline" className="flex-1">Retour</Button>
                  <Button onClick={handleVerify} disabled={verifying || (callBackend && !otp)} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                    {verifying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Vérification...</> : "Valider le retrait"}
                  </Button>
                </div>

                <div className="text-xs text-neutral-500">
                  Après vérification, le traitement final sera effectué par le backend (webhooks opérateurs).
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}