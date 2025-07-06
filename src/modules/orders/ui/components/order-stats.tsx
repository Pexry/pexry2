"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface OrderStatsProps {
  stats: {
    total: number;
    pending: number;
    paid: number;
    delivered: number;
    totalSpent: number;
  };
  hidePending?: boolean; // New prop to hide pending orders
}

export const OrderStats = ({ stats, hidePending = false }: OrderStatsProps) => {
  const statItems = [
    {
      title: "Successful Purchases",
      value: stats.paid + stats.delivered,
      description: "Paid & delivered",
      icon: "✅",
    },
    ...(!hidePending ? [{
      title: "Pending Orders",
      value: stats.pending,
      description: "Awaiting payment",
      icon: "⏳",
    }] : []),
    {
      title: "Total Spent",
      value: formatCurrency(stats.totalSpent),
      description: "Successfully purchased",
      icon: "💰",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {item.title}
            </CardTitle>
            <span className="text-lg">{item.icon}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
