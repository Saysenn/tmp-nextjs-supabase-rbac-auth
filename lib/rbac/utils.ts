import { User } from '@supabase/supabase-js';
import {
  ROLES,
  ROLE_HIERARCHY,
  ROUTE_ACCESS,
  DEFAULT_ROLE,
} from './config';
import type { RoleName, Permission } from './types';

/**
 * Get user's roles from Supabase user object.
 * Supports both single role (string) and multiple roles (array).
 * Normalizes roles to uppercase to match ROLES config.
 * Returns array of valid role names.
 */
export function getUserRoles(user: User | null): RoleName[] {
  if (!user) return [];

  const roleData = user.user_metadata?.role;

  if (!roleData) {
    return [DEFAULT_ROLE as RoleName];
  }

  // Handle both single role (string) and multiple roles (array)
  const roles = Array.isArray(roleData) ? roleData : [roleData];

  // Normalize to uppercase and filter to only valid role names
  const validRoles = roles
    .map((role) => String(role).toUpperCase())
    .filter((role): role is RoleName => role in ROLES);

  // Return default role if no valid roles found
  return validRoles.length > 0 ? validRoles : [DEFAULT_ROLE as RoleName];
}

/**
 * Get all permissions for a user based on their roles.
 * Combines permissions from all roles the user has.
 */
export function getUserPermissions(user: User | null): Permission[] {
  const roles = getUserRoles(user);

  if (roles.length === 0) return [];

  // Combine permissions from all roles using Set to dedupe
  const permissionSet = new Set<Permission>();

  for (const role of roles) {
    const rolePermissions = ROLES[role];
    if (rolePermissions) {
      rolePermissions.forEach((permission) => {
        permissionSet.add(permission as Permission);
      });
    }
  }

  return Array.from(permissionSet);
}

/**
 * Check if user has a specific permission.
 * Returns true if ANY of the user's roles has the permission.
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
  const roles = getUserRoles(user);
  return roles.some((role) => ROLES[role]?.has(permission));
}

/**
 * Check if user has ANY of the specified permissions.
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(user, permission));
}

/**
 * Check if user has ALL of the specified permissions.
 */
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(user, permission));
}

/**
 * Check if user has a specific role.
 * Accepts single role or array of roles.
 * Returns true if user has ANY of the specified roles.
 */
export function hasRole(user: User | null, role: RoleName | RoleName[]): boolean {
  const userRoles = getUserRoles(user);

  if (userRoles.length === 0) return false;

  const rolesToCheck = Array.isArray(role) ? role : [role];
  return rolesToCheck.some((r) => userRoles.includes(r));
}

/**
 * Check if user's highest role is at least the specified minimum role.
 * Based on ROLE_HIERARCHY values.
 */
export function isRoleAtLeast(user: User | null, minimumRole: RoleName): boolean {
  const userRoles = getUserRoles(user);

  if (userRoles.length === 0) return false;

  const minLevel = ROLE_HIERARCHY[minimumRole] ?? 0;

  // Get the highest role level from user's roles
  const userMaxLevel = Math.max(
    ...userRoles.map((role) => ROLE_HIERARCHY[role] ?? 0)
  );

  return userMaxLevel >= minLevel;
}

/**
 * Check if user can access a specific route.
 * Based on ROUTE_ACCESS configuration.
 */
export function canAccessRoute(user: User | null, pathname: string): boolean {
  const userRoles = getUserRoles(user);

  if (userRoles.length === 0) return false;

  // Sort routes by specificity (longer paths first)
  const sortedRoutes = Object.keys(ROUTE_ACCESS).sort(
    (a, b) => b.length - a.length
  );

  // Find the most specific matching route
  for (const route of sortedRoutes) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      const allowedRoles = ROUTE_ACCESS[route];
      // Check if user has any of the allowed roles
      return allowedRoles.some((role) => userRoles.includes(role as RoleName));
    }
  }

  // No specific route config found - allow access
  return true;
}

/**
 * Get all available role names.
 */
export function getAllRoles(): RoleName[] {
  return Object.keys(ROLES) as RoleName[];
}

/**
 * Get all permissions for a specific role.
 */
export function getRolePermissions(role: RoleName): Permission[] {
  return Array.from(ROLES[role] || []) as Permission[];
}

/**
 * Check if a role name is valid.
 */
export function isValidRole(role: string): role is RoleName {
  return role in ROLES;
}

/**
 * Get the display name for a role (capitalize first letter, lowercase rest).
 */
export function getRoleDisplayName(role: RoleName): string {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
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
