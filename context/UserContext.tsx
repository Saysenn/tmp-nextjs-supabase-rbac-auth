'use client';
import { createContext, useContext, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { useSupabaseUser } from '../hooks/useSupabaseUser';
import { getRoleFromUser, type Role } from '../lib/rbac';

interface UserContextType {
  user: User | null;
  loading: boolean;
  role: Role | null;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabaseUser();

  const role = useMemo<Role | null>(() => {
    if (!user) return null;
    return getRoleFromUser(user);
  }, [user]);

  return (
    <UserContext.Provider value={{ user, loading, role }}>
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
