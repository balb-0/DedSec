import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Select } from "../ui/select";

interface User {
  id: number;
  nome: string;
  rfid_codigo: string;
  ativo: boolean;
  sala_id: number | null;
}

interface Sala {
  id: number;
  nome: string;
  localizacao: string;
  status: string;
}

interface Alocacao {
  id: number;
  inicio: string;
  fim: string | null;
  sala_id: number;
  sala_nome: string;
  sala_localizacao: string;
  status: "em_andamento" | "completa";
}

export function TasksManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [alocacoes, setAlocacoes] = useState<Alocacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [selectedSala, setSelectedSala] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskStartTime, setTaskStartTime] = useState("");
  const [taskEndTime, setTaskEndTime] = useState("");

  // Buscar usuários ao digitar
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setSearchResults(data.data);
            }
          })
          .catch((err) => {
            console.error("Erro ao buscar usuários:", err);
          });
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Carregar alocações quando selecionar usuário
  useEffect(() => {
    if (selectedUser) {
      setLoading(true);
      fetch(`/api/users/${selectedUser.id}/alocacoes`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setAlocacoes(data.data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Erro ao buscar alocações:", err);
          setLoading(false);
        });
    } else {
      setAlocacoes([]);
    }
  }, [selectedUser]);

  // Carregar salas ao abrir modal e resetar campos
  useEffect(() => {
    if (showAssignModal) {
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

      // Resetar campos do formulário
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().slice(0, 5);

      setTaskDate(today);
      setTaskStartTime(currentTime);
      setTaskEndTime("");
    } else {
      // Limpar campos ao fechar modal
      setSelectedSala("");
      setTaskDate("");
      setTaskStartTime("");
      setTaskEndTime("");
    }
  }, [showAssignModal]);

  const handleAssignTask = async () => {
    if (!selectedUser || !selectedSala || !taskDate || !taskStartTime) {
      alert(
        "Preencha todos os campos obrigatórios: Sala, Data e Hora de Início"
      );
      return;
    }

    // Validar se hora fim é depois da hora início (se preenchida)
    if (taskEndTime && taskEndTime <= taskStartTime) {
      alert("A hora de fim deve ser posterior à hora de início");
      return;
    }

    try {
      // Montar data/hora de início
      const inicioDateTime = `${taskDate}T${taskStartTime}:00`;

      // Montar data/hora de fim (se preenchida)
      let fimDateTime: string | null = null;
      if (taskEndTime) {
        fimDateTime = `${taskDate}T${taskEndTime}:00`;
      }

      const response = await fetch("/api/alocacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          sala_id: parseInt(selectedSala),
          inicio: inicioDateTime,
          fim: fimDateTime,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Recarregar alocações
        fetch(`/api/users/${selectedUser.id}/alocacoes`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setAlocacoes(data.data);
            }
          });

        setShowAssignModal(false);
        setSelectedSala("");
        setTaskDate("");
        setTaskStartTime("");
        setTaskEndTime("");
      } else {
        alert(data.error || "Erro ao atribuir tarefa");
      }
    } catch (err) {
      console.error("Erro ao atribuir tarefa:", err);
      alert("Erro ao atribuir tarefa. Tente novamente.");
    }
  };

  const handleCompleteTask = async (alocacaoId: number) => {
    if (!confirm("Tem certeza que deseja marcar esta tarefa como completa?")) {
      return;
    }

    try {
      const response = await fetch(`/api/alocacoes/${alocacaoId}/complete`, {
        method: "PUT",
      });

      const data = await response.json();

      if (data.success && selectedUser) {
        // Recarregar alocações
        fetch(`/api/users/${selectedUser.id}/alocacoes`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setAlocacoes(data.data);
            }
          });
      } else {
        alert(data.error || "Erro ao finalizar tarefa");
      }
    } catch (err) {
      console.error("Erro ao finalizar tarefa:", err);
      alert("Erro ao finalizar tarefa. Tente novamente.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tarefasAtivas = alocacoes.filter((a) => a.status === "em_andamento");
  const tarefasCompletas = alocacoes.filter((a) => a.status === "completa");

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Tarefas</CardTitle>
          <CardDescription>
            Busque um trabalhador e gerencie suas tarefas (alocações de salas)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Busca de Trabalhador */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar Trabalhador</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Digite o nome do trabalhador..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Resultados da busca */}
            {searchResults.length > 0 && (
              <div className="border rounded-md mt-2 max-h-60 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      setSelectedUser(user);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                  >
                    <p className="font-medium">{user.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      RFID: {user.rfid_codigo}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trabalhador Selecionado */}
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.nome}</h3>
                  <p className="text-sm text-muted-foreground">
                    RFID: {selectedUser.rfid_codigo}
                  </p>
                </div>
                <Button
                  onClick={() => setShowAssignModal(true)}
                  size="sm"
                  disabled={tarefasAtivas.length > 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Atribuir Nova Tarefa
                </Button>
              </div>

              {tarefasAtivas.length > 0 && (
                <div className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                  ⚠️ Este trabalhador já possui uma tarefa em andamento.
                  Finalize a tarefa atual antes de atribuir uma nova.
                </div>
              )}

              {loading ? (
                <div className="text-center py-8">Carregando tarefas...</div>
              ) : (
                <>
                  {/* Tarefas Ativas */}
                  {tarefasAtivas.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Tarefas em Andamento
                      </h4>
                      {tarefasAtivas.map((alocacao) => (
                        <div
                          key={alocacao.id}
                          className="border rounded-lg p-4 space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <p className="font-semibold">
                                  {alocacao.sala_nome}
                                </p>
                                <Badge variant="default">Em Andamento</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {alocacao.sala_localizacao}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Iniciada em: {formatDate(alocacao.inicio)}
                              </p>
                            </div>
                            <Button
                              onClick={() => handleCompleteTask(alocacao.id)}
                              size="sm"
                              variant="outline"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Marcar como Completa
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tarefas Completas */}
                  {tarefasCompletas.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Tarefas Completas
                      </h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {tarefasCompletas.map((alocacao) => (
                          <div
                            key={alocacao.id}
                            className="border rounded-lg p-4 bg-muted/50"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <p className="font-semibold">
                                {alocacao.sala_nome}
                              </p>
                              <Badge variant="secondary">Completa</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {alocacao.sala_localizacao}
                            </p>
                            <div className="text-xs text-muted-foreground mt-2 space-y-1">
                              <p>Iniciada: {formatDate(alocacao.inicio)}</p>
                              {alocacao.fim && (
                                <p>Finalizada: {formatDate(alocacao.fim)}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {tarefasAtivas.length === 0 &&
                    tarefasCompletas.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhuma tarefa encontrada para este trabalhador.
                      </div>
                    )}
                </>
              )}
            </div>
          )}

          {!selectedUser && (
            <div className="text-center py-12 text-muted-foreground">
              Busque um trabalhador para começar a gerenciar tarefas
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para Atribuir Nova Tarefa */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Nova Tarefa</DialogTitle>
            <DialogDescription>
              Selecione a sala para atribuir ao trabalhador {selectedUser?.nome}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sala">Sala *</Label>
              <Select
                id="sala"
                value={selectedSala}
                onChange={(e) => setSelectedSala(e.target.value)}
              >
                <option value="">Selecione uma sala</option>
                {salas.map((sala) => (
                  <option key={sala.id} value={sala.id}>
                    {sala.nome} - {sala.localizacao}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDate">Data da Tarefa *</Label>
              <Input
                id="taskDate"
                type="date"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taskStartTime">Hora de Início *</Label>
                <Input
                  id="taskStartTime"
                  type="time"
                  value={taskStartTime}
                  onChange={(e) => setTaskStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskEndTime">Hora de Fim (opcional)</Label>
                <Input
                  id="taskEndTime"
                  type="time"
                  value={taskEndTime}
                  onChange={(e) => setTaskEndTime(e.target.value)}
                  min={taskStartTime || undefined}
                />
              </div>
            </div>

            {taskEndTime && taskEndTime <= taskStartTime && taskStartTime && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                A hora de fim deve ser posterior à hora de início
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignModal(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAssignTask}
                disabled={Boolean(
                  !selectedSala ||
                    !taskDate ||
                    !taskStartTime ||
                    (taskEndTime && taskEndTime <= taskStartTime)
                )}
              >
                Atribuir Tarefa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
