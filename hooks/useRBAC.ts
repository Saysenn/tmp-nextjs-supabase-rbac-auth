'use client';

import { useMemo } from 'react';
import { useUser } from '../context/UserContext';
import {
  type Role,
  type Permission,
  getRoleFromUser,
  hasRole as checkHasRole,
  hasPermission as checkHasPermission,
  isRoleAtLeast as checkIsRoleAtLeast,
  canAccessRoute as checkCanAccessRoute,
  getPermissionsForRole,
} from '../lib/rbac';

/**
 * Hook for role-based access control
 *
 * @example
 * ```tsx
 * const { role, hasRole, hasPermission, canAccess } = useRBAC();
 *
 * if (hasPermission('users:delete')) {
 *   // Show delete button
 * }
 *
 * if (hasRole(['admin', 'super_admin'])) {
 *   // Show admin panel
 * }
 *
 * if (canAccess('/dashboard/admin')) {
 *   // Show admin link
 * }
 * ```
 */
export function useRBAC() {
  const { user, loading } = useUser();

  const role = useMemo<Role | null>(() => {
    if (!user) return null;
    return getRoleFromUser(user);
  }, [user]);

  const permissions = useMemo<Permission[]>(() => {
    if (!role) return [];
    return getPermissionsForRole(role);
  }, [role]);

  const hasRole = useMemo(() => {
    return (requiredRole: Role | Role[]): boolean => {
      return checkHasRole(role, requiredRole);
    };
  }, [role]);

  const hasPermission = useMemo(() => {
    return (permission: Permission): boolean => {
      return checkHasPermission(role, permission);
    };
  }, [role]);

  const isRoleAtLeast = useMemo(() => {
    return (minimumRole: Role): boolean => {
      return checkIsRoleAtLeast(role, minimumRole);
    };
  }, [role]);

  const canAccess = useMemo(() => {
    return (pathname: string): boolean => {
      return checkCanAccessRoute(role, pathname);
    };
  }, [role]);

  return {
    role,
    permissions,
    loading,
    hasRole,
    hasPermission,
    isRoleAtLeast,
    canAccess,
  };
}
