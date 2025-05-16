
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType, Family, Profile } from "@/types/auth";
import { toast } from "sonner";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  
  // Função para buscar o perfil do usuário
  const fetchProfile = async (userId: string) => {
    try {
      console.log("Buscando perfil para usuário:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Erro ao buscar perfil:", error.message);
        throw error;
      }
      
      if (data) {
        console.log("Perfil encontrado:", data);
        setProfile(data as Profile);
        
        // Buscar informações da família
        if (data.family_id) {
          console.log("Buscando família:", data.family_id);
          const { data: familyData, error: familyError } = await supabase
            .from('families')
            .select('*')
            .eq('id', data.family_id)
            .single();
          
          if (familyError) {
            console.error("Erro ao buscar família:", familyError.message);
            throw familyError;
          }
          if (familyData) {
            console.log("Família encontrada:", familyData);
            setFamily(familyData as Family);
          }
        } else {
          console.log("Usuário não tem família associada");
        }
      }
    } catch (error: any) {
      console.error("Erro ao buscar perfil:", error.message);
    }
  };
  
  // Inicialização - verificar usuário atual e configurar listener
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // Configurar o listener para mudanças de estado de autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log("Auth state changed:", event, session?.user?.email);
          setSession(session);
          setUser(session?.user || null);
          
          if (session?.user) {
            // Usar setTimeout para evitar deadlocks
            setTimeout(() => {
              fetchProfile(session.user.id);
            }, 0);
          } else {
            setProfile(null);
            setFamily(null);
          }
        }
      );
      
      // Verificar sessão atual
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);
      
      if (data.session?.user) {
        await fetchProfile(data.session.user.id);
      }
      
      setLoading(false);
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initAuth();
  }, []);
  
  // Limpar estado de autenticação
  const cleanupAuthState = () => {
    // Remover tokens de autenticação padrão
    localStorage.removeItem('supabase.auth.token');
    
    // Remover todas as chaves de autenticação do Supabase do localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remover do sessionStorage se estiver em uso
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  // Função para criar uma nova família
  const createFamily = async () => {
    try {
      console.log("Criando nova família");
      // Gerar código de família usando nossa função SQL
      const { data: codeData, error: codeError } = await supabase.rpc('generate_family_code');
      
      if (codeError) {
        console.error("Erro ao gerar código de família:", codeError.message);
        throw codeError;
      }
      
      console.log("Código de família gerado:", codeData);
      
      // Criar nova entrada na tabela de famílias
      const { data, error } = await supabase
        .from('families')
        .insert({ code: codeData })
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao criar família:", error.message);
        throw error;
      }
      
      console.log("Família criada com sucesso:", data);
      return data;
    } catch (error: any) {
      console.error("Erro ao criar família:", error.message);
      throw error;
    }
  };

  // Função para encontrar uma família pelo código
  const findFamilyByCode = async (code: string) => {
    try {
      console.log("Buscando família pelo código:", code);
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .eq('code', code)
        .single();
      
      if (error) {
        console.error("Erro ao buscar família pelo código:", error.message);
        throw error;
      }
      
      console.log("Família encontrada:", data);
      return data;
    } catch (error) {
      console.error("Família não encontrada ou erro:", error);
      return null;
    }
  };

  // Função de registro
  const signUp = async (email: string, password: string, name: string, familyCode?: string) => {
    try {
      setLoading(true);
      
      // Limpar estado de autenticação para evitar conflitos
      cleanupAuthState();
      
      // Tenta fazer logout global para garantir estado limpo
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continua mesmo se falhar
        console.log("Erro no logout global (ignorável):", err);
      }
      
      // Determinar família - procurar pelo código ou criar nova
      let family;
      
      if (familyCode) {
        // Procurar família existente pelo código
        family = await findFamilyByCode(familyCode);
        if (!family) {
          toast.error("Erro no cadastro", {
            description: "Código de família não encontrado"
          });
          throw new Error("Código de família não encontrado");
        }
      } else {
        // Criar nova família
        family = await createFamily();
      }
      
      console.log("Família para cadastro:", family);
      
      // Registrar usuário com metadados para o trigger SQL
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            family_id: family.id
          }
        }
      });
      
      if (error) {
        console.error("Erro no cadastro:", error.message);
        throw error;
      }
      
      if (data.user) {
        toast.success("Conta criada com sucesso!");
        console.log("Usuário registrado com sucesso:", data.user.email);
      } else {
        console.log("Criação de usuário retornou:", data);
      }
      
    } catch (error: any) {
      console.error("Erro completo ao criar conta:", error);
      toast.error("Erro ao criar conta", {
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função de login
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Limpar estado de autenticação para evitar conflitos
      cleanupAuthState();
      
      // Tenta fazer logout global para garantir estado limpo
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continua mesmo se falhar
        console.log("Erro no logout global (ignorável):", err);
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Erro no login:", error.message);
        throw error;
      }
      
      if (data.user) {
        console.log("Login realizado com sucesso:", data.user.email);
        toast.success("Login realizado com sucesso!");
      }
      
    } catch (error: any) {
      console.error("Detalhes do erro:", error);
      toast.error("Falha no login", {
        description: error.message || "Verifique seu email e senha"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const signOut = async () => {
    try {
      setLoading(true);
      
      // Limpar estado de autenticação
      cleanupAuthState();
      
      // Tenta fazer logout global
      await supabase.auth.signOut({ scope: 'global' });
      
      // Forçar recarregamento da página para estado limpo
      window.location.href = '/auth';
      
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error.message);
      toast.error("Erro ao fazer logout", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar perfil
  const updateProfile = async (name: string) => {
    try {
      if (!user) throw new Error("Usuário não autenticado");
      
      const { error } = await supabase
        .from('profiles')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (error) {
        console.error("Erro ao atualizar perfil:", error.message);
        throw error;
      }
      
      // Atualizar estado local
      if (profile) {
        setProfile({
          ...profile,
          name
        });
      }
      
      toast.success("Perfil atualizado com sucesso!");
      
      // Registrar atividade
      try {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          family_id: profile?.family_id,
          action_type: 'update_profile',
          description: 'Perfil atualizado'
        });
      } catch (error) {
        console.error("Erro ao registrar atividade:", error);
        // Não interromper o fluxo por erro no log
      }
      
    } catch (error: any) {
      console.error("Erro completo ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil", {
        description: error.message
      });
    }
  };

  // Função para ingressar em uma nova família
  const joinFamily = async (familyCode: string) => {
    try {
      if (!user || !profile) throw new Error("Usuário não autenticado");
      
      // Encontrar família pelo código
      const family = await findFamilyByCode(familyCode);
      if (!family) {
        toast.error("Erro ao ingressar na família", {
          description: "Código de família não encontrado"
        });
        throw new Error("Código de família não encontrado");
      }
      
      // Atualizar perfil do usuário com nova família
      const { error } = await supabase
        .from('profiles')
        .update({ 
          family_id: family.id,
          updated_at: new Date().toISOString() 
        })
        .eq('id', user.id);
      
      if (error) {
        console.error("Erro ao atualizar perfil com nova família:", error.message);
        throw error;
      }
      
      // Atualizar estado local
      setProfile({
        ...profile,
        family_id: family.id
      });
      
      setFamily(family as Family);
      
      toast.success("Ingressado em nova família com sucesso!");
      
      // Registrar atividade
      try {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          family_id: family.id,
          action_type: 'join_family',
          description: 'Ingressou em nova família'
        });
      } catch (error) {
        console.error("Erro ao registrar atividade:", error);
        // Não interromper o fluxo por erro no log
      }
      
    } catch (error: any) {
      console.error("Erro completo ao ingressar na família:", error);
      toast.error("Erro ao ingressar na família", {
        description: error.message
      });
    }
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    family,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    joinFamily
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
