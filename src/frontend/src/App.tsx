import { DashboardHeader } from "./components/dashboard/header";
import { UsersTable } from "./components/dashboard/users-table";
import { KpiGrid } from "./components/dashboard/kpi-grid";
import React from "react";

function App() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-6 lg:p-8">
        <DashboardHeader />

        <div className="space-y-6">
          <KpiGrid />
          <UsersTable />
        </div>
      </div>
    </main>
  );
}

export default App;
