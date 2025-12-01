import { Button } from "../../components/ui/button";
import { Bell, Settings } from "lucide-react";
import React from "react";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard - DedSec
        </h1>
        <p className="text-muted-foreground">
          Sistema de controle de acesso e monitoramento de salas
        </p>
      </div>
    </header>
  );
}
