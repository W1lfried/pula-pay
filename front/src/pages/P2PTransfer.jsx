import React, { useEffect, useMemo, useState } from "react";
import { Transaction } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { callBackendFunction } from "@/components/backend";
import { ArrowLeft, Loader2, Search, User as UserIcon, Users, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function P2PTransfer() {
  const [me, setMe] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [queryName, setQueryName] = useState("");
  const [queryPhone, setQueryPhone] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [pin, setPin] = useState("");
  const [callBackend, setCallBackend] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdTx, setCreatedTx] = useState(null);

  useEffect(() => { load(); }, []);
  const load = async () => {
    const current = await UserEntity.me();
    setMe(current);
    const users = await UserEntity.list();
    setContacts(users.filter(u => u.id !== current.id));
  };

  const filteredByName = useMemo(() => {
    const q = queryName.trim().toLowerCase();
    if (!q) return contacts.slice(0, 5);
    return contacts.filter(u =>
      (u.full_name || "").toLowerCase().includes(q)
    ).slice(0, 10);
  }, [contacts, queryName]);

  const matchedByPhone = useMemo(() => {
    const q = queryPhone.trim();
    if (!q) return null;
    return contacts.find(u => (u.phone || "").includes(q));
  }, [contacts, queryPhone]);

  const quickAmounts = [1000, 2000, 5000, 10000, 20000];

  const reference = () => `PLA${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0,14)}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecipient || !amount) return;

    setSubmitting(true);
    const ref = reference();

    const tx = await Transaction.create({
      type: "p2p_transfer",
      amount: Number(amount),
      status: "pending",
      recipient_user_id: selectedRecipient.id,
      recipient_phone: selectedRecipient.phone || "",
      reference: ref,
      description: note ? `P2P → ${selectedRecipient.full_name}: ${note}` : `P2P → ${selectedRecipient.full_name}`,
      fee: 0
    });

    if (callBackend) {
      await callBackendFunction("p2pTransferInternal", {
        transaction_id: tx.id,
        sender_user_id: me.id,
        recipient_user_id: selectedRecipient.id,
        amount: Number(amount),
        note,
        pin
      });
    }

    setCreatedTx(tx);
    setSubmitting(false);
  };

  if (createdTx) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white p-4 md:p-8">
        <div className="max-w-xl mx-auto">
          <Card className="card-glow border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Transfert P2P initié
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-neutral-500">Bénéficiaire</div>
                <div className="font-medium">{selectedRecipient.full_name}</div>
                <div className="text-neutral-500">Montant</div>
                <div className="font-medium">{new Intl.NumberFormat('fr-FR').format(createdTx.amount)} XOF</div>
                <div className="text-neutral-500">Référence</div>
                <div className="font-mono">{createdTx.reference}</div>
                <div className="text-neutral-500">Statut</div>
                <div><Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">pending</Badge></div>
              </div>
              <div className="flex gap-3">
                <Link to={createPageUrl("Transactions")}><Button variant="outline">Voir transactions</Button></Link>
                <Button onClick={() => { setCreatedTx(null); setAmount(""); setNote(""); setPin(""); }} className="bg-gradient-to-r from-orange-500 to-red-500 text-white">Nouveau transfert</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold">Transfert PulaPay → PulaPay</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="card-glow border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Choisir le bénéficiaire
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="name">
                <TabsList className="bg-neutral-100">
                  <TabsTrigger value="name">Par nom</TabsTrigger>
                  <TabsTrigger value="phone">Par téléphone</TabsTrigger>
                  <TabsTrigger value="contacts">Contacts</TabsTrigger>
                </TabsList>

                <TabsContent value="name" className="space-y-3 pt-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <Input className="pl-9" placeholder="Nom complet" value={queryName} onChange={(e) => setQueryName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    {filteredByName.map(u => (
                      <button key={u.id} type="button" onClick={() => setSelectedRecipient(u)} className={`w-full text-left p-3 border rounded-xl hover:bg-neutral-50 transition ${selectedRecipient?.id === u.id ? 'border-orange-300 bg-orange-50' : 'border-neutral-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-neutral-200 flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-neutral-600" />
                          </div>
                          <div>
                            <div className="font-medium">{u.full_name || "Utilisateur"}</div>
                            <div className="text-xs text-neutral-500">{u.phone || u.email}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                    {filteredByName.length === 0 && <p className="text-xs text-neutral-500">Aucun résultat</p>}
                  </div>
                </TabsContent>

                <TabsContent value="phone" className="space-y-3 pt-3">
                  <Label>Numéro du bénéficiaire</Label>
                  <Input placeholder="+229XXXXXXXX" value={queryPhone} onChange={(e) => setQueryPhone(e.target.value)} />
                  {matchedByPhone ? (
                    <div className={`p-3 border rounded-xl ${selectedRecipient?.id === matchedByPhone.id ? 'border-orange-300 bg-orange-50' : 'border-neutral-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-neutral-200 flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-neutral-600" />
                          </div>
                          <div>
                            <div className="font-medium">{matchedByPhone.full_name || "Utilisateur"}</div>
                            <div className="text-xs text-neutral-500">{matchedByPhone.phone || matchedByPhone.email}</div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setSelectedRecipient(matchedByPhone)}>Sélectionner</Button>
                      </div>
                    </div>
                  ) : (
                    queryPhone && <p className="text-xs text-neutral-500">Aucun utilisateur trouvé pour ce numéro</p>
                  )}
                </TabsContent>

                <TabsContent value="contacts" className="space-y-2 pt-3 max-h-80 overflow-auto">
                  {contacts.map(u => (
                    <div key={u.id} className={`p-3 border rounded-xl flex items-center justify-between ${selectedRecipient?.id === u.id ? 'border-orange-300 bg-orange-50' : 'border-neutral-200'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-neutral-200 flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-neutral-600" />
                        </div>
                        <div>
                          <div className="font-medium">{u.full_name || "Utilisateur"}</div>
                          <div className="text-xs text-neutral-500">{u.phone || u.email}</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setSelectedRecipient(u)}>Choisir</Button>
                    </div>
                  ))}
                  {contacts.length === 0 && <p className="text-xs text-neutral-500">Aucun autre utilisateur inscrit pour l’instant.</p>}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="card-glow border-0">
            <CardHeader>
              <CardTitle>Détails du transfert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-2">
                <Label>Montant (XOF)</Label>
                <Input type="number" min="100" step="50" placeholder="Ex: 2000" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <div className="flex flex-wrap gap-2 pt-1">
                  {quickAmounts.map(v => (
                    <Button key={v} type="button" variant="outline" size="sm" onClick={() => setAmount(String(v))}>
                      {new Intl.NumberFormat('fr-FR').format(v)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Message (optionnel)</Label>
                <Input placeholder="Ex: Participation, cadeau..." value={note} onChange={(e) => setNote(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label>PIN secondaire (sécurité)</Label>
                <Input type="password" placeholder="****" value={pin} onChange={(e) => setPin(e.target.value)} />
                <p className="text-xs text-neutral-500">Ne sera jamais stocké — transmis uniquement au backend si activé.</p>
              </div>

              <div className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <p className="text-sm font-medium">Appeler le backend</p>
                  <p className="text-xs text-neutral-500">Sinon, enregistre en attente (simulation)</p>
                </div>
                <Switch checked={callBackend} onCheckedChange={setCallBackend} />
              </div>

              <Button disabled={submitting || !selectedRecipient || !amount} onClick={handleSubmit} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi...</> : "Envoyer l’argent"}
              </Button>

              {selectedRecipient && (
                <div className="text-xs text-neutral-600">
                  Envoi à <span className="font-medium">{selectedRecipient.full_name}</span> ({selectedRecipient.phone || selectedRecipient.email})
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}