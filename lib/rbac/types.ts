import { ROLES, PERMISSIONS } from './config';

// Role name type (ADMIN, AGENT, USER, etc.)
export type RoleName = keyof typeof ROLES;

// Permission type
export type Permission = (typeof PERMISSIONS)[number];

// Route access configuration type
export interface RouteAccessConfig {
  path: string;
  roles: RoleName[];
  exact?: boolean;
}

// RBAC context type for the hook
export interface RBACContext {
  roles: RoleName[];
  permissions: Permission[];
  hasRole: (role: RoleName | RoleName[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  isRoleAtLeast: (minimumRole: RoleName) => boolean;
  canAccess: (pathname: string) => boolean;
}

// User with roles type (extends Supabase User metadata)
// Supports both single role (string) and multiple roles (array)
export interface UserWithRoles {
  id: string;
  email?: string;
  user_metadata: {
    role?: string | string[];  // Can be "ADMIN" or ["ADMIN", "AGENT"]
    full_name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
}

// Guard component props
export interface RoleGuardProps {
  children: React.ReactNode;
  role?: RoleName;
  roles?: RoleName[];
  fallback?: React.ReactNode;
}

export interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;  // If true, user needs ALL permissions; if false (default), ANY permission
  fallback?: React.ReactNode;
}
