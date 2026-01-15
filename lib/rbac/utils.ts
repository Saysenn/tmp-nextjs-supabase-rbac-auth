import {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  ROUTE_ACCESS,
  DEFAULT_ROLE,
} from './config';
import type { Role, Permission } from './types';

/**
 * Get the hierarchy level for a role
 */
export function getRoleLevel(role: Role | null | undefined): number {
  if (!role) return 0;
  return ROLE_HIERARCHY[role] ?? 0;
}

/**
 * Check if a user has a specific role (exact match)
 */
export function hasRole(
  userRole: Role | null | undefined,
  requiredRole: Role | Role[]
): boolean {
  if (!userRole) return false;

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }

  return userRole === requiredRole;
}

/**
 * Check if user's role is at least the minimum required role (hierarchy-based)
 */
export function isRoleAtLeast(
  userRole: Role | null | undefined,
  minimumRole: Role
): boolean {
  if (!userRole) return false;
  return getRoleLevel(userRole) >= getRoleLevel(minimumRole);
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  userRole: Role | null | undefined,
  permission: Permission
): boolean {
  if (!userRole) return false;

  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;

  return (allowedRoles as readonly string[]).includes(userRole);
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: Role | null | undefined): Permission[] {
  if (!role) return [];

  const permissions: Permission[] = [];

  for (const [permission, roles] of Object.entries(PERMISSIONS)) {
    if ((roles as readonly string[]).includes(role)) {
      permissions.push(permission as Permission);
    }
  }

  return permissions;
}

/**
 * Check if a user can access a specific route based on their role
 */
export function canAccessRoute(
  userRole: Role | null | undefined,
  pathname: string
): boolean {
  if (!userRole) return false;

  // Sort routes by specificity (longer paths first)
  const sortedRoutes = Object.keys(ROUTE_ACCESS).sort(
    (a, b) => b.length - a.length
  );

  // Find the most specific matching route
  for (const route of sortedRoutes) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      const allowedRoles = ROUTE_ACCESS[route];
      if (allowedRoles) {
        return (allowedRoles as readonly string[]).includes(userRole);
      }
    }
  }

  // If no specific route rule found, allow access (route might not need role protection)
  return true;
}

/**
 * Get the role from user metadata with fallback to default role
 */
export function getRoleFromUser(user: { user_metadata?: { role?: string } } | null): Role {
  const role = user?.user_metadata?.role;

  // Validate that the role exists in our ROLES config
  const validRoles = Object.values(ROLES) as string[];
  if (role && validRoles.includes(role)) {
    return role as Role;
  }

  return DEFAULT_ROLE;
}

/**
 * Check if a pathname matches protected routes (requires authentication)
 */
export function isProtectedRoute(pathname: string, protectedRoutes: string[]): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * Check if a pathname matches auth routes (should redirect authenticated users)
 */
export function isAuthRoute(pathname: string, authRoutes: string[]): boolean {
  return authRoutes.some((route) => pathname === route);
}

/**
 * Get all roles as an array
 */
export function getAllRoles(): Role[] {
  return Object.values(ROLES);
}

/**
 * Validate if a string is a valid role
 */
export function isValidRole(role: string): role is Role {
  return (Object.values(ROLES) as string[]).includes(role);
}
