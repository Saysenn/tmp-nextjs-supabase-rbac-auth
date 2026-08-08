'use client';

import { useRBAC } from '../../hooks/useRBAC';
import type { Permission } from '../../lib/rbac';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;  // If true, user needs ALL permissions; if false (default), ANY permission
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user's permission
 *
 * @example
 * ```tsx
 * // Single permission
 * <PermissionGuard permission="User:Delete">
 *   <DeleteUserButton />
 * </PermissionGuard>
 *
 * // Multiple permissions - user needs ANY of them
 * <PermissionGuard permissions={['Report:View', 'Report:Export']}>
 *   <ReportSection />
 * </PermissionGuard>
 *
 * // Multiple permissions - user needs ALL of them
 * <PermissionGuard permissions={['User:Read', 'User:Write']} requireAll>
 *   <UserEditor />
 * </PermissionGuard>
 *
 * // With fallback
 * <PermissionGuard permission="Report:Export" fallback={<UpgradePrompt />}>
 *   <ExportButton />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = useRBAC();

  // Don't render anything while loading
  if (loading) {
    return null;
  }

  // Single permission check
  if (permission) {
    if (!hasPermission(permission)) {
      return <>{fallback}</>;
    }
    return <>{children}</>;
  }

  // Multiple permissions check
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
