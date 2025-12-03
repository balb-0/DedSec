import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import React, { useState, useEffect } from "react";

interface Sala {
  id: number;
  nome: string;
  localizacao: string;
}

interface UserFormData {
  nome: string;
  rfid_codigo: string;
  sala_id: string;
  ativo: boolean;
}

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    id: number;
    nome: string;
    rfid_codigo: string;
    sala_id: number | null;
    ativo: boolean;
  } | null;
  onSuccess: () => void;
}

export function UserFormModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserFormModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    nome: "",
    rfid_codigo: "",
    sala_id: "",
    ativo: true,
  });
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar salas ao abrir o modal
  useEffect(() => {
    if (open) {
      fetch("/api/salas")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setSalas(data.data);
          }
        })
        .catch((err) => {
          console.error("Erro ao buscar salas:", err);
        });
    }
  }, [open]);

  // Preencher formulário quando editar
  useEffect(() => {
    if (user && open) {
      setFormData({
        nome: user.nome,
        rfid_codigo: user.rfid_codigo,
        sala_id: user.sala_id?.toString() || "",
        ativo: user.ativo,
      });
    } else if (open) {
      // Resetar formulário para criar novo
      setFormData({
        nome: "",
        rfid_codigo: "",
        sala_id: "",
        ativo: true,
      });
    }
    setError(null);
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        nome: formData.nome,
        rfid_codigo: formData.rfid_codigo,
        ativo: formData.ativo,
      };

      if (formData.sala_id) {
        payload.sala_id = parseInt(formData.sala_id);
      } else {
        payload.sala_id = null;
      }

      const url = user ? `/api/users/${user.id}` : "/api/users";
      const method = user ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError(data.error || "Erro ao salvar usuário");
      }
    } catch (err) {
      setError("Erro ao salvar usuário. Tente novamente.");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Atualize as informações do usuário"
              : "Preencha os dados para cadastrar um novo usuário"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfid_codigo">Código RFID *</Label>
            <Input
              id="rfid_codigo"
              value={formData.rfid_codigo}
              onChange={(e) =>
                setFormData({ ...formData, rfid_codigo: e.target.value })
              }
              placeholder="Ex: A1B2C3D4"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sala_id">Sala</Label>
            <Select
              id="sala_id"
              value={formData.sala_id}
              onChange={(e) =>
                setFormData({ ...formData, sala_id: e.target.value })
              }
            >
              <option value="">Nenhuma</option>
              {salas.map((sala) => (
                <option key={sala.id} value={sala.id}>
                  {sala.nome} - {sala.localizacao}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="ativo"
              checked={formData.ativo}
              onChange={(e) =>
                setFormData({ ...formData, ativo: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="ativo" className="cursor-pointer">
              Usuário ativo
            </Label>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : user ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
