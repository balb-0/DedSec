import { KpiCard } from "./kpi-card";
import { Users, UserCheck, Building2, DoorOpen } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalSalas: number;
  salasDisponiveis: number;
  salasOcupadas: number;
}

export function KpiGrid() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar estatísticas:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const kpiData = [
    {
      title: "Total de Usuários",
      value: stats.totalUsers.toString(),
      change: `${stats.activeUsers} ativos`,
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Usuários Ativos",
      value: stats.activeUsers.toString(),
      change: `${stats.totalUsers - stats.activeUsers} inativos`,
      changeType:
        stats.activeUsers > 0 ? ("positive" as const) : ("neutral" as const),
      icon: UserCheck,
    },
    {
      title: "Total de Salas",
      value: stats.totalSalas.toString(),
      change: `${stats.salasDisponiveis} disponíveis`,
      changeType: "positive" as const,
      icon: Building2,
    },
    {
      title: "Salas Ocupadas",
      value: stats.salasOcupadas.toString(),
      change: `${stats.salasDisponiveis} disponíveis`,
      changeType:
        stats.salasOcupadas < stats.totalSalas
          ? ("positive" as const)
          : ("negative" as const),
      icon: DoorOpen,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi) => (
        <KpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  );
}
