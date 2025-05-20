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
    
    // Usando trim para remover espaços extras que possam ter sido inseridos
    const cleanCode = code.trim().toUpperCase(); // Convertendo para uppercase para garantir correspondência
    
    console.log("Código limpo para busca:", cleanCode);
    
    // Usar a função find_family_by_code que criamos no banco de dados
    // Esta função tem SECURITY DEFINER e pode ser usada sem autenticação
    const { data, error } = await supabase
      .rpc('find_family_by_code', { code_to_find: cleanCode });
    
    if (error) {
      console.error("Erro ao buscar família pelo código:", error.message);
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log("Família encontrada:", data);
      return data[0] as Family;
    }
    
    // Log para debug se não encontrou
    console.log("Nenhuma família encontrada com o código:", cleanCode);
    
    // Também vamos listar todas as famílias existentes para fins de debug
    console.log("Consultando todas as famílias disponíveis para debug");
    const { data: allFamilies, error: allError } = await supabase
      .from('families')
      .select('id, code, created_at')
      .limit(10);
      
    if (allError) {
      console.error("Erro ao listar todas as famílias:", allError.message);
    } else {
      console.log("Todas as famílias disponíveis:", allFamilies);
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao buscar família:", error);
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

/**
 * Get all family members for a specific family ID
 */
export const getFamilyMembers = async (familyId: string): Promise<any[]> => {
  try {
    if (!familyId) {
      console.error("ID da família não fornecido para getFamilyMembers");
      return [];
    }
    
    console.log("Buscando membros da família ID:", familyId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('family_id', familyId);
    
    if (error) {
      console.error("Erro ao buscar membros da família:", error.message);
      throw error;
    }
    
    console.log("Membros da família encontrados:", data?.length || 0, data);
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar membros da família:", error);
    return [];
  }
};
