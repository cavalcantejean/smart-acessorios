
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingBag, MessageSquare } from 'lucide-react';

interface AnalyticsSummaryCardsProps {
  totalUsers: number;
  totalAccessories: number;
  totalComments: number;
}

export default function AnalyticsSummaryCards({
  totalUsers,
  totalAccessories,
  totalComments,
}: AnalyticsSummaryCardsProps) {
  const summaryItems = [
    { title: 'Total de Usuários', value: totalUsers, icon: Users, color: 'text-blue-500' },
    { title: 'Total de Acessórios', value: totalAccessories, icon: ShoppingBag, color: 'text-green-500' },
    { title: 'Total de Comentários Aprovados', value: totalComments, icon: MessageSquare, color: 'text-orange-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {summaryItems.map((item) => (
        <Card key={item.title} className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
            <item.icon className={`h-5 w-5 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
