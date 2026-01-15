'use client';

import { useRBAC } from '../../hooks/useRBAC';
import type { Permission } from '../../lib/rbac';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: Permission;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user's permission
 *
 * @example
 * ```tsx
 * <PermissionGuard permission="users:delete">
 *   <DeleteUserButton />
 * </PermissionGuard>
 *
 * <PermissionGuard permission="reports:export" fallback={<UpgradePrompt />}>
 *   <ExportButton />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  children,
  permission,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, loading } = useRBAC();

  // Don't render anything while loading
  if (loading) {
    return null;
  }

  // Check if user has required permission
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
