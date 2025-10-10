// app/(dashboard)/clients/components/Charts/ClientsPieChart.tsx
"use client";
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

type Slice = { name: string; value: number };

type Props = {
  data?: Slice[]; // ex: [{ name: "Particulier", value: 120 }, { name: "Société", value: 30 }]
  height?: number;
};

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const MOCK: Slice[] = [
  { name: "Particulier", value: 124 },
  { name: "Société", value: 36 },
];

export default function ClientsPieChart({ data = MOCK, height = 200 }: Props) {
  return (
    <div className="w-full">
      <h4 className="text-sm font-medium mb-2">Répartition des clients</h4>
      <div className="bg-white rounded p-3 shadow-sm">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={38}
              outerRadius={68}
              paddingAngle={4}
              label={({ name, percent }) => `${name} (${Math.round(percent * 100)}%)`}
            >
              {data.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip formatter={(v: any) => `${v}`} />
            <Legend layout="horizontal" verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
