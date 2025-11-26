import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { DataTable, StatusBadge, type TableColumn } from "./data-table";
import { Avatar, AvatarFallback } from "../ui/avatar";
import React, { useEffect, useState } from "react";

interface User {
  id: number;
  nome: string;
  rfid_codigo: string;
  ativo: boolean;
  created_at: string;
}

const columns: TableColumn<User>[] = [
  {
    key: "nome",
    header: "Usuário",
    render: (item) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            {item.nome
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{item.nome}</p>
          <p className="text-sm text-muted-foreground">{item.rfid_codigo}</p>
        </div>
      </div>
    ),
  },
  {
    key: "rfid_codigo",
    header: "RFID",
  },
  {
    key: "ativo",
    header: "Status",
    render: (item) => (
      <StatusBadge status={item.ativo ? "Completed" : "Pending"} />
    ),
  },
  {
    key: "created_at",
    header: "Cadastrado em",
    render: (item) => {
      const date = new Date(item.created_at);
      return date.toLocaleDateString("pt-BR");
    },
  },
];

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar usuários:", err);
        setLoading(false);
      });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários</CardTitle>
        <CardDescription>
          Lista de usuários cadastrados no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : (
          <DataTable
            data={users as unknown as Record<string, unknown>[]}
            columns={
              columns as unknown as TableColumn<Record<string, unknown>>[]
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
