// app/(dashboard)/clients/components/Charts/TopClientsBarChart.tsx
"use client";
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

type Item = { name: string; value: number };

type Props = {
  data?: Item[]; // ex: [{ name: "TechPlus", value: 12000 }, ...]
  height?: number;
  currencyLabel?: string;
  topN?: number;
};

const MOCK: Item[] = [
  { name: "TechPlus", value: 12300 },
  { name: "Amine B.", value: 9800 },
  { name: "Alpha SARL", value: 7200 },
  { name: "Beta Co.", value: 5600 },
  { name: "Gamma", value: 4300 },
  { name: "Delta", value: 3100 },
  { name: "Epsilon", value: 2100 },
];

export default function TopClientsBarChart({
  data = MOCK,
  height = 200,
  currencyLabel = "DA",
  topN = 5,
}: Props) {
  const top = [...data].sort((a, b) => b.value - a.value).slice(0, topN);

  return (
    <div className="w-full">
      <h4 className="text-sm font-medium mb-2">Top {topN} clients</h4>
      <div className="bg-white rounded p-3 shadow-sm">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={top} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: any) => `${Number(value).toLocaleString()} ${currencyLabel}`} />
            <Legend verticalAlign="top" height={20} />
            <Bar dataKey="value" name={`CA (${currencyLabel})`} fill="#06b6d4" barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
