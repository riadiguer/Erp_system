// app/(dashboard)/clients/components/Charts/ClientSalesEvolution.tsx
"use client";
import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

type Point = { date: string; value: number };

type Props = {
  data?: Point[]; // [{ date: "2025-01", value: 1234 }, ...]
  height?: number;
  currencyLabel?: string;
};

const MOCK: Point[] = [
  { date: "2024-11", value: 1200 },
  { date: "2024-12", value: 1800 },
  { date: "2025-01", value: 1500 },
  { date: "2025-02", value: 2100 },
  { date: "2025-03", value: 1700 },
  { date: "2025-04", value: 2600 },
  { date: "2025-05", value: 2300 },
  { date: "2025-06", value: 2800 },
  { date: "2025-07", value: 3000 },
  { date: "2025-08", value: 3200 },
];

export default function ClientSalesEvolution({ data = MOCK, height = 260, currencyLabel = "DA" }: Props) {
  return (
    <div className="w-full h-[--h]" style={{ ["--h" as any]: `${height}px` }}>
      <h4 className="text-sm font-medium mb-2">Évolution du chiffre d’affaires</h4>
      <div className="bg-white rounded p-3 shadow-sm">
        <ResponsiveContainer width="100%" height={height - 48}>
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: any) => [`${Number(value).toLocaleString()} ${currencyLabel}`, "CA"]}
              labelFormatter={(label) => `Période: ${label}`}
            />
            <Legend verticalAlign="top" height={20} />
            <Area type="monotone" dataKey="value" name={`CA (${currencyLabel})`} stroke="#2563EB" fill="url(#colorUv)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
