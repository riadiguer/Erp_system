"use client";
import React from "react";
import { AlertTriangle, AlertCircle, Info, Clock, User, CheckCircle, Bell } from "lucide-react";

export type AlertLevel = "info" | "warning" | "critical";

export type ClientAlert = {
  id: string;
  clientId?: string;
  clientName?: string;
  message: string;
  level: AlertLevel;
  createdAt: string;
  dueDate?: string;
  resolved?: boolean;
};

type Props = {
  alerts?: ClientAlert[];
  onResolve?: (id: string) => void;
  onSnooze?: (id: string, days: number) => void;
  onViewClient?: (clientId?: string) => void;
  maxItems?: number;
};

const MOCK_ALERTS: ClientAlert[] = [
  {
    id: "a1",
    clientId: "c1",
    clientName: "Amine Bendjeb",
    message: "Paiement en retard : facture #2025-08, montant 120 DA",
    level: "critical",
    createdAt: "2025-08-01",
    dueDate: "2025-08-10",
    resolved: false,
  },
  {
    id: "a2",
    clientId: "c3",
    clientName: "Sara Benali",
    message: "Solde faible : solde = 450 DA (à surveiller)",
    level: "warning",
    createdAt: "2025-09-01",
    resolved: false,
  },
  {
    id: "a3",
    clientId: "c2",
    clientName: "TechPlus SARL",
    message: "Nouveau document : contrat signé (voir pièces jointes)",
    level: "info",
    createdAt: "2025-09-10",
    resolved: false,
  },
];

function daysBetween(dateA: string, dateB: string) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  const ms = a.getTime() - b.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function prettyDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString();
}

function levelConfig(level: AlertLevel) {
  switch (level) {
    case "critical":
      return {
        bg: "bg-red-50",
        border: "border-red-300",
        accent: "text-red-700",
        iconBg: "bg-red-100",
        icon: <AlertTriangle className="w-5 h-5" />,
        badge: "bg-red-100 text-red-800 border-red-200"
      };
    case "warning":
      return {
        bg: "bg-yellow-50",
        border: "border-yellow-300",
        accent: "text-yellow-700",
        iconBg: "bg-yellow-100",
        icon: <AlertCircle className="w-5 h-5" />,
        badge: "bg-yellow-100 text-yellow-800 border-yellow-200"
      };
    default:
      return {
        bg: "bg-blue-50",
        border: "border-blue-300",
        accent: "text-blue-700",
        iconBg: "bg-blue-100",
        icon: <Info className="w-5 h-5" />,
        badge: "bg-blue-100 text-blue-800 border-blue-200"
      };
  }
}

export default function ClientAlerts({
  alerts = MOCK_ALERTS,
  onResolve = () => {},
  onSnooze = () => {},
  onViewClient = () => {},
  maxItems = 6,
}: Props) {
  const nowISO = new Date().toISOString().slice(0, 10);
  const visible = alerts.slice(0, maxItems);
  const unresolvedCount = alerts.filter(a => !a.resolved).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-gray-900">Alertes clients</h4>
              <p className="text-sm text-gray-500">{unresolvedCount} alerte(s) non résolue(s)</p>
            </div>
          </div>
          {unresolvedCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {unresolvedCount} actives
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        {visible.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600">Aucune alerte pour le moment</p>
            <p className="text-xs text-gray-500 mt-1">Tout est sous contrôle</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((a) => {
              const config = levelConfig(a.level);
              const dueInfo = a.dueDate ? (() => {
                const daysLeft = daysBetween(a.dueDate!, nowISO);
                if (daysLeft < 0) return { text: `${Math.abs(daysLeft)} jour(s) de retard`, urgent: true };
                if (daysLeft === 0) return { text: "Échéance aujourd'hui", urgent: true };
                return { text: `dans ${daysLeft} jour(s)`, urgent: false };
              })() : null;

              return (
                <div
                  key={a.id}
                  className={`border ${config.border} ${config.bg} rounded-lg p-4 transition-all hover:shadow-md`}
                  role="region"
                  aria-label={`Alerte ${a.level}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center ${config.accent}`}>
                      {config.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-900">
                              {a.clientName ?? "Client inconnu"}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.badge}`}>
                              {a.level}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{a.message}</p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-gray-500 mb-1">
                            {prettyDate(a.createdAt)}
                          </div>
                          {dueInfo && (
                            <div className={`flex items-center gap-1 text-xs font-medium ${dueInfo.urgent ? 'text-red-600' : 'text-gray-600'}`}>
                              <Clock className="w-3 h-3" />
                              {dueInfo.text}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => onViewClient(a.clientId)}
                          className="text-xs px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
                        >
                          Voir client
                        </button>

                        {!a.resolved && (
                          <>
                            <button
                              onClick={() => onResolve(a.id)}
                              className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                            >
                              Marquer résolu
                            </button>

                            <button
                              onClick={() => onSnooze(a.id, 7)}
                              className="text-xs px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
                              title="Reporter 7 jours"
                            >
                              Reporter 7j
                            </button>
                          </>
                        )}

                        {a.resolved && (
                          <span className="inline-flex items-center text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Résolu
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {alerts.length > maxItems && (
          <div className="mt-4 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
              Voir toutes les alertes ({alerts.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}