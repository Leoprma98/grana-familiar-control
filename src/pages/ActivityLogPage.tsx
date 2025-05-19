
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Clock, FileText, Loader2, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ActivityLog {
  id: string;
  user_id: string;
  family_id: string;
  action_type: string;
  description: string;
  created_at: string;
  profiles?: {
    name: string;
  } | null;
}

const ActivityLogPage: React.FC = () => {
  const { profile } = useAuth();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchActivityLogs = async () => {
      if (profile?.family_id) {
        try {
          setLoading(true);
          
          const { data, error } = await supabase
            .from('activity_logs')
            .select(`
              *,
              profiles:user_id (
                name
              )
            `)
            .eq('family_id', profile.family_id)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          // Convert the data to the expected type
          const typedData = data as unknown as ActivityLog[];
          setActivityLogs(typedData);
        } catch (error) {
          console.error("Erro ao buscar histórico de atividades:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchActivityLogs();
    
    // Configurar uma atualização periódica do histórico
    const interval = setInterval(fetchActivityLogs, 30000); // Atualiza a cada 30 segundos
    
    return () => clearInterval(interval);
  }, [profile?.family_id]);
  
  // Filtrar logs por pesquisa e tipo
  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = searchTerm === "" || 
                          log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.profiles?.name && log.profiles.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === null || log.action_type === filterType;
    
    return matchesSearch && matchesType;
  });
  
  // Obter tipos de ação únicos para o filtro
  const actionTypes = [...new Set(activityLogs.map(log => log.action_type))];
  
  // Função para renderizar ícone com base no tipo de ação
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'add_income':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'add_expense':
        return <Activity className="h-4 w-4 text-red-500" />;
      case 'update_profile':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'join_family':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'add_savings_goal':
        return <Activity className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Função para formatar a data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between flex-col md:flex-row gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Histórico de Atividades
        </h1>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial md:min-w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={filterType || ""} onValueChange={(value) => setFilterType(value === "" ? null : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {actionTypes.map(type => (
                <SelectItem key={type} value={type}>{type.replace(/_/g, ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registros de Atividade</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum registro de atividade encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map(log => (
                <div key={log.id} className="border p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getActionIcon(log.action_type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {log.profiles?.name || "Usuário"}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                      <p className="text-sm">{log.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Tipo: {log.action_type.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogPage;
