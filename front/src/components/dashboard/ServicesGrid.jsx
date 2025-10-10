import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Wifi, 
  Send, 
  Receipt, 
  Zap, 
  Tv,
  Building2,
  Droplets
} from "lucide-react";

const getServiceIcon = (iconName) => {
  const icons = {
    smartphone: Smartphone,
    wifi: Wifi,
    send: Send,
    receipt: Receipt,
    zap: Zap,
    tv: Tv,
    building2: Building2,
    droplets: Droplets
  };
  return icons[iconName] || Receipt;
};

const getOperatorColor = (operator) => {
  const colors = {
    MTN: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Celtiis: "bg-green-100 text-green-800 border-green-200",
    Moov: "bg-purple-100 text-purple-800 border-purple-200",
    SBEE: "bg-blue-100 text-blue-800 border-blue-200",
    "Canal+": "bg-red-100 text-red-800 border-red-200",
    Soneb: "bg-cyan-100 text-cyan-800 border-cyan-200"
  };
  return colors[operator] || "bg-gray-100 text-gray-800 border-gray-200";
};

export default function ServicesGrid({ services }) {
  // Protection contre les props manquantes
  const safeServices = Array.isArray(services) ? services : [];
  
  const categorizedServices = safeServices.reduce((acc, service) => {
    const category = service?.category || "autres";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {});

  const categoryTitles = {
    recharge: "Recharges téléphoniques",
    internet: "Forfaits Internet",
    transfer: "Transferts d'argent",
    bills: "Paiement de factures",
    utilities: "Services publics",
    autres: "Autres services"
  };

  if (safeServices.length === 0) {
    return (
      <Card className="card-glow border-0">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="font-bold text-neutral-900 mb-2">Services en préparation</h3>
          <p className="text-neutral-500 monospace text-sm">
            Les services de paiement seront bientôt disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">Services disponibles</h2>
      <div className="space-y-8">
        {Object.entries(categorizedServices).map(([category, categoryServices]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 monospace">
              {categoryTitles[category] || category}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              {categoryServices.map((service) => {
                if (!service?.id) return null;
                
                const IconComponent = getServiceIcon(service.icon);
                return (
                  <Card 
                    key={service.id} 
                    className="card-glow border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-neutral-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-neutral-900">{service.name || "Service"}</h4>
                            <p className="text-xs text-neutral-500 monospace">{service.category || "général"}</p>
                          </div>
                        </div>
                        <Badge className={`${getOperatorColor(service.operator)} border`}>
                          {service.operator || "Général"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-500 monospace">
                          {service.min_amount && `${service.min_amount} - ${service.max_amount || '∞'} XOF`}
                        </span>
                        <span className="text-neutral-400 monospace">
                          Frais: {service.fee_percentage > 0 ? `${service.fee_percentage}%` : 
                                  service.fixed_fee > 0 ? `${service.fixed_fee} XOF` : 'Gratuit'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}