
import { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  name: string;
  family_id: string;
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  code: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  family: Family | null;
  loading: boolean;
}

export interface AuthContextType {
  session: any;
  user: User | null;
  profile: Profile | null;
  family: Family | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, familyCode?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  joinFamily: (familyCode: string) => Promise<void>;
}

export type AuthAction = 
  | 'signup'
  | 'login'
  | 'logout' 
  | 'update_profile' 
  | 'join_family';
