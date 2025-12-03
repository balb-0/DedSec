import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { DataTable, StatusBadge, type TableColumn } from "./data-table";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { UserDetailModal, type User as UserType } from "./user-detail-modal";
import { UserFormModal } from "./user-form-modal";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import React, { useEffect, useState } from "react";

interface User {
  id: number;
  nome: string;
  rfid_codigo: string;
  ativo: boolean;
  sala_id: number | null;
  created_at: string;
}

const createColumns = (
  onEdit: (user: User) => void,
  onDelete: (user: User) => void,
  onView: (user: User) => void
): TableColumn<User>[] => [
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
      <StatusBadge status={item.ativo ? "Finalizado" : "Em andamento"} />
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
  {
    key: "actions",
    header: "Ações",
    render: (item) => (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            onView(item);
          }}
          title="Ver detalhes"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
          title="Editar"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          title="Deletar"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const fetchUsers = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRowClick = (user: Record<string, unknown>) => {
    const userObj = user as unknown as User;
    setSelectedUser(userObj);
    setDetailModalOpen(true);
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setUserToEdit(user);
    setFormModalOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (
      !confirm(
        `Tem certeza que deseja deletar o usuário "${user.nome}"?\n\nEsta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchUsers(); // Recarregar lista
      } else {
        alert(data.error || "Erro ao deletar usuário");
      }
    } catch (err) {
      console.error("Erro ao deletar usuário:", err);
      alert("Erro ao deletar usuário. Tente novamente.");
    }
  };

  const handleNewUser = () => {
    setUserToEdit(null);
    setFormModalOpen(true);
  };

  const handleFormSuccess = () => {
    fetchUsers(); // Recarregar lista após criar/editar
  };

  const columns = createColumns(handleEdit, handleDelete, handleView);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuários</CardTitle>
              <CardDescription>
                Lista de usuários cadastrados no sistema
              </CardDescription>
            </div>
            <Button onClick={handleNewUser} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
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
              onRowClick={handleRowClick}
            />
          )}
        </CardContent>
      </Card>

      <UserDetailModal
        user={selectedUser}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />

      <UserFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        user={userToEdit}
        onSuccess={handleFormSuccess}
      />
    </>
  );
}
