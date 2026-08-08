'use client';

import { useRBAC } from '../../hooks/useRBAC';
import type { RoleName } from '../../lib/rbac';

interface RoleGuardProps {
  children: React.ReactNode;
  role?: RoleName;
  roles?: RoleName[];
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user's role
 *
 * @example
 * ```tsx
 * // Single role
 * <RoleGuard role="ADMIN">
 *   <AdminPanel />
 * </RoleGuard>
 *
 * // Multiple roles (user needs ANY of these)
 * <RoleGuard roles={['ADMIN', 'AGENT']} fallback={<p>Access denied</p>}>
 *   <ManagementPanel />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({ children, role, roles, fallback = null }: RoleGuardProps) {
  const { hasRole, loading } = useRBAC();

  // Don't render anything while loading
  if (loading) {
    return null;
  }

  // Determine which roles to check
  const rolesToCheck = role ? [role] : roles || [];

  // Check if user has required role
  if (rolesToCheck.length > 0 && !hasRole(rolesToCheck)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
