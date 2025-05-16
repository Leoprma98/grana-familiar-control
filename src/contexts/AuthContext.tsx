
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType, Family, Profile } from "@/types/auth";
import { toast } from "sonner";
import { 
  fetchUserProfile, 
  signUpUser, 
  signInUser, 
  signOutUser,
  updateUserProfile,
  joinFamily as joinFamilyService
} from "@/services/authService";
import { logUserActivity } from "@/utils/authUtils";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  
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
              fetchUserProfile(session.user.id).then(({ profile, family }) => {
                setProfile(profile);
                setFamily(family);
              });
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
        const { profile, family } = await fetchUserProfile(data.session.user.id);
        setProfile(profile);
        setFamily(family);
      }
      
      setLoading(false);
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initAuth();
  }, []);

  // Função de registro
  const signUp = async (email: string, password: string, name: string, familyCode?: string) => {
    try {
      setLoading(true);
      await signUpUser(email, password, name, familyCode);
    } finally {
      setLoading(false);
    }
  };

  // Função de login
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInUser(email, password);
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const signOut = async () => {
    try {
      setLoading(true);
      await signOutUser();
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar perfil
  const updateProfile = async (name: string) => {
    try {
      if (!user || !profile) throw new Error("Usuário não autenticado");
      
      await updateUserProfile(user.id, profile.family_id, name);
      
      // Atualizar estado local
      setProfile({
        ...profile,
        name
      });
      
      // Registrar atividade
      await logUserActivity(
        user.id, 
        profile.family_id, 
        'update_profile', 
        'Perfil atualizado'
      );
      
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
    }
  };

  // Função para ingressar em uma nova família
  const joinFamily = async (familyCode: string) => {
    try {
      if (!user || !profile) throw new Error("Usuário não autenticado");
      
      const newFamily = await joinFamilyService(user.id, profile.id, familyCode);
      
      // Atualizar estado local
      setProfile({
        ...profile,
        family_id: newFamily.id
      });
      
      setFamily(newFamily);
      
      // Registrar atividade
      await logUserActivity(
        user.id, 
        newFamily.id, 
        'join_family', 
        'Ingressou em nova família'
      );
      
    } catch (error: any) {
      console.error("Erro ao ingressar na família:", error);
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
