"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xl">
        <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between space-x-4">
            <span className="text-xs font-medium" style={{ color: entry.color }}>
              {entry.name}
            </span>
            <span className="text-sm font-bold text-gray-900">
              {entry.value.toLocaleString()} DA
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function SupplierEvolutionChart() {
  const data = [
    { month: "Jan", achats: 450000, paiements: 400000 },
    { month: "Fév", achats: 380000, paiements: 350000 },
    { month: "Mar", achats: 510000, paiements: 500000 },
    { month: "Avr", achats: 620000, paiements: 580000 },
    { month: "Mai", achats: 700000, paiements: 640000 },
    { month: "Juin", achats: 800000, paiements: 720000 },
    { month: "Juil", achats: 850000, paiements: 780000 },
    { month: "Août", achats: 760000, paiements: 710000 },
    { month: "Sept", achats: 900000, paiements: 850000 },
  ];

  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
      
      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-gray-50 to-blue-50/30 px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Évolution des achats et paiements
            </h3>
            <p className="text-sm text-gray-600">Tendance sur les 9 derniers mois</p>
          </div>
          
          {/* Legend Pills */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-xs font-semibold text-blue-900">Achats</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-xs font-semibold text-green-900">Paiements</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative z-10 p-6">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAchats" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPaiements" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              vertical={false}
            />
            
            <XAxis
              dataKey="month"
              stroke="#9ca3af"
              style={{ fontSize: "12px", fontWeight: "500" }}
              tickLine={false}
              axisLine={false}
            />
            
            <YAxis
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              stroke="#9ca3af"
              style={{ fontSize: "12px", fontWeight: "500" }}
              tickLine={false}
              axisLine={false}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="achats"
              stroke="#2563eb"
              strokeWidth={3}
              fill="url(#colorAchats)"
              name="Achats"
              dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2, fill: "#2563eb" }}
            />
            
            <Area
              type="monotone"
              dataKey="paiements"
              stroke="#22c55e"
              strokeWidth={3}
              fill="url(#colorPaiements)"
              name="Paiements"
              dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2, fill: "#22c55e" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Footer */}
      <div className="relative z-10 px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs font-medium text-gray-600 mb-1">Total achats</p>
            <p className="text-lg font-bold text-blue-600">5.97M DA</p>
          </div>
          <div className="text-center border-x border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-1">Total paiements</p>
            <p className="text-lg font-bold text-green-600">5.53M DA</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-gray-600 mb-1">Solde restant</p>
            <p className="text-lg font-bold text-amber-600">440K DA</p>
          </div>
        </div>
      </div>
    </div>
  );
}