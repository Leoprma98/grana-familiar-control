
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cleanupAuthState, createFamily, findFamilyByCode } from "@/utils/authUtils";
import type { Profile, Family } from "@/types/auth";

/**
 * Fetch user profile and associated family
 */
export const fetchUserProfile = async (userId: string): Promise<{
  profile: Profile | null;
  family: Family | null;
}> => {
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
    
    let family = null;
    
    if (data && data.family_id) {
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
        family = familyData as Family;
      }
    } else {
      console.log("Usuário não tem família associada");
    }
    
    return {
      profile: data as Profile,
      family
    };
  } catch (error: any) {
    console.error("Erro ao buscar perfil:", error.message);
    return { profile: null, family: null };
  }
};

/**
 * Sign up a new user
 */
export const signUpUser = async (email: string, password: string, name: string, familyCode?: string): Promise<void> => {
  try {
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
  }
};

/**
 * Sign in a user
 */
export const signInUser = async (email: string, password: string): Promise<void> => {
  try {
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
  }
};

/**
 * Sign out a user
 */
export const signOutUser = async (): Promise<void> => {
  try {
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
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, familyId: string | null, name: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) {
      console.error("Erro ao atualizar perfil:", error.message);
      throw error;
    }
    
    toast.success("Perfil atualizado com sucesso!");
  } catch (error: any) {
    console.error("Erro completo ao atualizar perfil:", error);
    toast.error("Erro ao atualizar perfil", {
      description: error.message
    });
    throw error;
  }
};

/**
 * Join a family
 */
export const joinFamily = async (userId: string, profileId: string, familyCode: string): Promise<Family> => {
  try {
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
      .eq('id', userId);
    
    if (error) {
      console.error("Erro ao atualizar perfil com nova família:", error.message);
      throw error;
    }
    
    toast.success("Ingressado em nova família com sucesso!");
    
    return family;
  } catch (error: any) {
    console.error("Erro completo ao ingressar na família:", error);
    toast.error("Erro ao ingressar na família", {
      description: error.message
    });
    throw error;
  }
};
