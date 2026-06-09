import React, { useMemo } from "react";
import { useLocation } from "wouter";
import { getParticipants } from "@/lib/storage";
import { Users, CreditCard, AlertCircle, Activity, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const stats = useMemo(() => {
    const participants = getParticipants();
    const active = participants.filter((p) => p.status === "active");
    const expired = participants.filter((p) => p.status === "expired");
    const totalPaid = participants.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    const totalRemaining = participants.reduce((sum, p) => sum + (p.amountRemaining || 0), 0);
    return {
      total: participants.length,
      active: active.length,
      expired: expired.length,
      totalPaid,
      totalRemaining,
    };
  }, []);

  const statCards = [
    {
      title: "إجمالي المشتركين",
      value: stats.total,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "الاشتراكات النشطة",
      value: stats.active,
      icon: Activity,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "الاشتراكات المنتهية",
      value: stats.expired,
      icon: AlertCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      title: "إجمالي المبالغ المدفوعة",
      value: `${stats.totalPaid.toLocaleString("ar-SA")} ريال`,
      icon: Banknote,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "إجمالي المبالغ المتبقية",
      value: `${stats.totalRemaining.toLocaleString("ar-SA")} ريال`,
      icon: CreditCard,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">نظرة عامة</h2>
        <p className="text-muted-foreground mt-1 font-medium">مرحباً بك في لوحة تحكم نادي النخبة</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => (
          <Card
            key={index}
            className="border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`w-8 h-8 rounded-md flex items-center justify-center ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mt-2">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 pt-2">
        <button
          onClick={() => setLocation("/participants")}
          className="text-sm text-primary hover:underline font-medium"
        >
          عرض جميع المشتركين
        </button>
        <span className="text-muted-foreground">·</span>
        <button
          onClick={() => setLocation("/participants/new")}
          className="text-sm text-primary hover:underline font-medium"
        >
          إضافة مشترك جديد
        </button>
      </div>
    </div>
  );
}
