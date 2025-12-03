import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";

export interface User {
  id: number;
  nome: string;
  rfid_codigo: string;
  ativo: boolean;
  created_at: string;
  sala_nome?: string;
  sala_localizacao?: string;
}

interface Alocacao {
  id: number;
  inicio: string;
  fim: string | null;
  sala_nome: string;
  sala_localizacao: string;
  sala_status: string;
}

interface UserDetail {
  id: number;
  nome: string;
  rfid_codigo: string;
  ativo: boolean;
  created_at: string;
  sala_nome?: string;
  sala_localizacao?: string;
  alocacoes: Alocacao[];
}

interface UserDetailModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailModal({
  user,
  open,
  onOpenChange,
}: UserDetailModalProps) {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      setLoading(true);
      fetch(`/api/users/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUserDetail(data.data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Erro ao buscar detalhes do usuário:", err);
          setLoading(false);
        });
    } else {
      setUserDetail(null);
    }
  }, [open, user]);

  if (!user) return null;

  const initials = user.nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (inicio: string, fim: string | null) => {
    if (!fim) return "Em andamento";

    const start = new Date(inicio);
    const end = new Date(fim);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`;
    }
    return `${diffMinutes}min`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
          <DialogDescription>
            Informações completas e histórico de alocações
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        ) : userDetail ? (
          <>
            {/* Informações do Usuário */}
            <div className="flex flex-col items-center gap-4 py-4 border-b">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-lg font-semibold">{userDetail.nome}</h3>
                <Badge
                  variant={userDetail.ativo ? "default" : "secondary"}
                  className="mt-2"
                >
                  {userDetail.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>

            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs font-mono">
                    {userDetail.rfid_codigo.slice(0, 4)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">RFID</p>
                  <p className="font-medium text-sm">
                    {userDetail.rfid_codigo}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Cadastrado em</p>
                  <p className="font-medium text-sm">
                    {formatDate(userDetail.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Sala Atual (se houver) */}
            {userDetail.sala_nome && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Sala Atual</p>
                </div>
                <p className="font-semibold">{userDetail.sala_nome}</p>
                {userDetail.sala_localizacao && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {userDetail.sala_localizacao}
                  </p>
                )}
              </div>
            )}

            {/* Histórico de Alocações */}
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Histórico de Alocações
              </h4>

              {userDetail.alocacoes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhuma alocação registrada
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {userDetail.alocacoes.map((alocacao) => (
                    <div
                      key={alocacao.id}
                      className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <p className="font-semibold text-sm">
                              {alocacao.sala_nome}
                            </p>
                            {alocacao.fim ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-orange-500" />
                            )}
                          </div>
                          {alocacao.sala_localizacao && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {alocacao.sala_localizacao}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={alocacao.fim ? "secondary" : "default"}
                          className="text-xs"
                        >
                          {alocacao.fim ? "Finalizada" : "Ativa"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-3 pt-3 border-t">
                        <div>
                          <p className="font-medium text-foreground mb-1">
                            Início
                          </p>
                          <p>{formatDate(alocacao.inicio)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground mb-1">
                            {alocacao.fim ? "Fim" : "Duração"}
                          </p>
                          <p>
                            {alocacao.fim
                              ? formatDate(alocacao.fim)
                              : formatDuration(alocacao.inicio, null)}
                          </p>
                        </div>
                        {alocacao.fim && (
                          <div className="col-span-2">
                            <p className="font-medium text-foreground mb-1">
                              Duração Total
                            </p>
                            <p>
                              {formatDuration(alocacao.inicio, alocacao.fim)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Erro ao carregar detalhes do usuário
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
