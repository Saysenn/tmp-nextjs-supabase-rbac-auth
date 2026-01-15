'use client';

import { useRBAC } from '../../hooks/useRBAC';
import type { Role } from '../../lib/rbac';

interface RoleGuardProps {
  children: React.ReactNode;
  roles: Role | Role[];
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user's role
 *
 * @example
 * ```tsx
 * // Single role
 * <RoleGuard roles="admin">
 *   <AdminPanel />
 * </RoleGuard>
 *
 * // Multiple roles
 * <RoleGuard roles={['admin', 'super_admin']} fallback={<p>Access denied</p>}>
 *   <AdminSettings />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const { hasRole, loading } = useRBAC();

  // Don't render anything while loading
  if (loading) {
    return null;
  }

  // Check if user has required role
  if (!hasRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
