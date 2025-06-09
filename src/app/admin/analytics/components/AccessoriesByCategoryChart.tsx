
"use client";

import type { CategoryCount } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface AccessoriesByCategoryChartProps {
  data: CategoryCount[];
}

export default function AccessoriesByCategoryChart({ data }: AccessoriesByCategoryChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-muted-foreground text-center py-4">Sem dados para exibir o gráfico de categorias.</p>;
  }

  // Prepare chart config for dynamic colors (optional, could use a fixed color)
  const chartConfig = {} as ChartConfig;
  data.forEach((item, index) => {
    chartConfig[item.category] = {
      label: item.category,
      // color: `hsl(var(--chart-${(index % 5) + 1}))`, // Use theme colors
      color: `hsl(${200 + index * 30}, 70%, 50%)` // Simple dynamic color
    };
  });
  
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
          <XAxis 
            dataKey="category" 
            tickLine={false} 
            axisLine={false} 
            stroke="#888888"
            fontSize={12}
            interval={0}
            angle={-35}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            allowDecimals={false} 
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))', radius: 4 }}
            content={<ChartTooltipContent />}
          />
          <Legend content={({ payload }) => {
             if (!payload) return null;
              return (
                <div className="flex items-center justify-center gap-x-4 gap-y-1 flex-wrap mt-4">
                  {payload.map((entry: any) => (
                    <div key={`item-${entry.value}`} className="flex items-center space-x-1.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-xs text-muted-foreground">{entry.value}</span>
                    </div>
                  ))}
                </div>
              );
          }}/>
          <Bar dataKey="count" fill="var(--color-primary)" radius={4} name="Acessórios" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
