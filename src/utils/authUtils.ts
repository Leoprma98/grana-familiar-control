
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Family } from "@/types/auth";

/**
 * Utility function to clean up authentication state
 * Removes all Supabase auth tokens from local storage
 */
export const cleanupAuthState = () => {
  // Remove tokens de autenticação padrão
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

/**
 * Creates a new family with a generated code
 */
export const createFamily = async (): Promise<Family> => {
  try {
    console.log("Criando nova família");
    // Gerar código de família usando nossa função SQL
    const { data: codeData, error: codeError } = await supabase.rpc('generate_family_code');
    
    if (codeError) {
      console.error("Erro ao gerar código de família:", codeError.message);
      throw codeError;
    }
    
    console.log("Código de família gerado:", codeData);
    
    // Criar nova entrada na tabela de famílias usando a função RPC que contorna RLS
    // Precisamos usar any aqui porque o tipo não está definido automaticamente pelo Supabase
    const { data, error } = await supabase
      .rpc('create_family', { family_code: codeData }) as any;
    
    if (error) {
      console.error("Erro ao criar família:", error.message);
      throw error;
    }
    
    console.log("Família criada com sucesso:", data);
    return data as Family;
  } catch (error: any) {
    console.error("Erro ao criar família:", error.message);
    throw error;
  }
};

/**
 * Find a family by its code
 */
export const findFamilyByCode = async (code: string): Promise<Family | null> => {
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
    return data as Family;
  } catch (error) {
    console.error("Família não encontrada ou erro:", error);
    return null;
  }
};

/**
 * Log user activity
 */
export const logUserActivity = async (userId: string, familyId: string | null, actionType: string, description: string): Promise<void> => {
  if (!familyId) return;
  
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      family_id: familyId,
      action_type: actionType,
      description
    });
  } catch (error) {
    console.error("Erro ao registrar atividade:", error);
    // Não interromper o fluxo por erro no log
  }
};
