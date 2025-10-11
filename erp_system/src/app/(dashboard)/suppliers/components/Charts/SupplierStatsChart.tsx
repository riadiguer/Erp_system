"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xl">
        <p className="text-sm font-semibold text-gray-900 mb-2">{payload[0].name}</p>
        <div className="flex items-center justify-between space-x-4">
          <span className="text-xs font-medium text-gray-600">Nombre</span>
          <span className="text-lg font-bold" style={{ color: payload[0].payload.fill }}>
            {payload[0].value}
          </span>
        </div>
        <div className="flex items-center justify-between space-x-4 mt-1">
          <span className="text-xs font-medium text-gray-600">Pourcentage</span>
          <span className="text-sm font-bold text-gray-900">
            {((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="font-bold text-sm"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function SupplierStatsChart() {
  const data = [
    { name: "Fournisseurs actifs", value: 8, color: "#22c55e" },
    { name: "Fournisseurs avec dette", value: 4, color: "#f59e0b" },
    { name: "Fournisseurs inactifs", value: 3, color: "#94a3b8" },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  const COLORS = ["#22c55e", "#f59e0b", "#94a3b8"];

  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-full blur-3xl opacity-20 -translate-y-1/2 -translate-x-1/2"></div>
      
      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-gray-50 to-green-50/30 px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Répartition des fournisseurs
            </h3>
            <p className="text-sm text-gray-600">Classification par statut</p>
          </div>
          
          {/* Total Badge */}
          <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
            <p className="text-xs font-medium text-blue-100">Total</p>
            <p className="text-2xl font-bold text-white">{total}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative z-10 p-6">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={dataWithTotal}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              label={CustomLabel}
              labelLine={false}
              paddingAngle={3}
            >
              {dataWithTotal.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend / Stats Footer */}
      <div className="relative z-10 px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between group hover:bg-white hover:shadow-sm px-3 py-2 rounded-lg transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-200"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-bold text-gray-900">{item.value}</span>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {((item.value / total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="relative z-10 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center justify-between text-white">
          <span className="text-xs font-semibold">Taux d'activité</span>
          <span className="text-sm font-bold">
            {((data[0].value / total) * 100).toFixed(0)}% actifs
          </span>
        </div>
      </div>
    </div>
  );
}