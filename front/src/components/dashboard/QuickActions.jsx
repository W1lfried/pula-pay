import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Wifi, Send, Receipt, ArrowLeftRight, Zap, CreditCard, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const quickActionsData = [
  {
    title: "Recharge",
    subtitle: "Crédit mobile",
    description: "MTN, Moov, Celtiis",
    icon: Smartphone,
    gradient: "from-yellow-400 to-orange-500",
    page: "Recharge"
  },
  {
    title: "Internet",
    subtitle: "Pass data",
    description: "Forfaits 3G/4G",
    icon: Wifi,
    gradient: "from-blue-400 to-blue-600",
    page: "Internet"
  },
  {
    title: "Transfert",
    subtitle: "Argent mobile",
    description: "Mobile Money",
    icon: Send,
    gradient: "from-green-400 to-emerald-600",
    page: "Transfer"
  },
  {
    title: "Factures",
    subtitle: "Services",
    description: "SBEE, Canal+",
    icon: Receipt,
    gradient: "from-purple-400 to-purple-600",
    page: "Bills"
  },
  {
    title: "P2P",
    subtitle: "PulaPay",
    description: "Entre utilisateurs",
    icon: ArrowLeftRight,
    gradient: "from-pink-400 to-rose-600",
    page: "P2PTransfer"
  },
  {
    title: "Entreprises",
    subtitle: "B2B",
    description: "Paiements pros",
    icon: Building2,
    gradient: "from-indigo-400 to-indigo-600",
    page: "Bills"
  }
];

export default function QuickActions({ services }) {
  return (
    <div className="animation-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-900">Services</h2>
        <Button variant="ghost" className="text-violet-600 hover:text-violet-700 text-sm font-medium">
          Voir tout
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickActionsData.map((action, index) => (
          <Link key={action.title} to={createPageUrl(action.page)}>
            <Card className="modern-card p-0 overflow-hidden cursor-pointer group hover:scale-105 transition-all duration-300">
              <CardContent className="p-5 text-center">
                <div className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-neutral-900 text-sm mb-1">{action.title}</h3>
                <p className="text-xs text-violet-600 font-medium mb-1">{action.subtitle}</p>
                <p className="text-xs text-neutral-500">{action.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}