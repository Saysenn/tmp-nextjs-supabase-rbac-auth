'use client';

import { useMemo, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import {
  type RoleName,
  type Permission,
  getUserRoles,
  getUserPermissions,
  hasRole as checkHasRole,
  hasPermission as checkHasPermission,
  hasAnyPermission as checkHasAnyPermission,
  hasAllPermissions as checkHasAllPermissions,
  isRoleAtLeast as checkIsRoleAtLeast,
  canAccessRoute as checkCanAccessRoute,
} from '../lib/rbac';

/**
 * Hook for role-based access control
 *
 * @example
 * ```tsx
 * const { roles, hasRole, hasPermission, canAccess } = useRBAC();
 *
 * // Check single permission
 * if (hasPermission('User:Delete')) {
 *   // Show delete button
 * }
 *
 * // Check multiple permissions (any)
 * if (hasAnyPermission(['User:Read', 'User:Write'])) {
 *   // Show user section
 * }
 *
 * // Check role
 * if (hasRole('ADMIN')) {
 *   // Show admin panel
 * }
 *
 * // Check multiple roles
 * if (hasRole(['ADMIN', 'AGENT'])) {
 *   // Show management panel
 * }
 *
 * // Check route access
 * if (canAccess('/dashboard/admin')) {
 *   // Show admin link
 * }
 * ```
 */
export function useRBAC() {
  const { user, loading } = useUser();

  // Get user's roles (supports multiple roles)
  const roles = useMemo<RoleName[]>(() => {
    return getUserRoles(user);
  }, [user]);

  // Get all permissions from all user's roles
  const permissions = useMemo<Permission[]>(() => {
    return getUserPermissions(user);
  }, [user]);

  // Check if user has a specific role (or any of multiple roles)
  const hasRole = useCallback(
    (role: RoleName | RoleName[]): boolean => {
      return checkHasRole(user, role);
    },
    [user]
  );

  // Check if user has a specific permission
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return checkHasPermission(user, permission);
    },
    [user]
  );

  // Check if user has ANY of the specified permissions
  const hasAnyPermission = useCallback(
    (permissionsToCheck: Permission[]): boolean => {
      return checkHasAnyPermission(user, permissionsToCheck);
    },
    [user]
  );

  // Check if user has ALL of the specified permissions
  const hasAllPermissions = useCallback(
    (permissionsToCheck: Permission[]): boolean => {
      return checkHasAllPermissions(user, permissionsToCheck);
    },
    [user]
  );

  // Check if user's highest role is at least the specified role
  const isRoleAtLeast = useCallback(
    (minimumRole: RoleName): boolean => {
      return checkIsRoleAtLeast(user, minimumRole);
    },
    [user]
  );

  // Check if user can access a specific route
  const canAccess = useCallback(
    (pathname: string): boolean => {
      return checkCanAccessRoute(user, pathname);
    },
    [user]
  );

  return {
    roles,
    permissions,
    loading,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRoleAtLeast,
    canAccess,
  };
}
