import { DashboardHeader } from "./components/dashboard/header";
import { UsersTable } from "./components/dashboard/users-table";
import { TasksManager } from "./components/dashboard/tasks-manager";
import { KpiGrid } from "./components/dashboard/kpi-grid";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import React, { useState } from "react";

function App() {
  const [activeTab, setActiveTab] = useState("usuarios");

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-6 lg:p-8">
        <DashboardHeader />

        <div className="space-y-6">
          <KpiGrid />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="usuarios">Usuários</TabsTrigger>
              <TabsTrigger value="tarefas">Gerenciar Tarefas</TabsTrigger>
            </TabsList>

            <TabsContent value="usuarios">
              <UsersTable />
            </TabsContent>

            <TabsContent value="tarefas">
              <TasksManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}

export default App;
