'use client';
import { createContext, useContext, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { useSupabaseUser } from '../hooks/useSupabaseUser';
import { getUserRoles, type RoleName } from '../lib/rbac';

interface UserContextType {
  user: User | null;
  loading: boolean;
  roles: RoleName[];
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabaseUser();

  const roles = useMemo<RoleName[]>(() => {
    return getUserRoles(user);
  }, [user]);

  return (
    <UserContext.Provider value={{ user, loading, roles }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
