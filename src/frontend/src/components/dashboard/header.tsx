import { Button } from "../../components/ui/button";
import { Bell, Settings } from "lucide-react";
import React from "react";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your overview.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
