import { ROLES, PERMISSIONS } from './config';

// Extract role values from ROLES constant
export type Role = (typeof ROLES)[keyof typeof ROLES];

// Extract permission keys from PERMISSIONS constant
export type Permission = keyof typeof PERMISSIONS;

// Route access configuration type
export interface RouteAccessConfig {
  path: string;
  roles: Role[];
  exact?: boolean; // If true, only exact path matches; if false (default), includes sub-routes
}

// RBAC context type for the hook
export interface RBACContext {
  role: Role | null;
  permissions: Permission[];
  hasRole: (role: Role | Role[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
  isRoleAtLeast: (minimumRole: Role) => boolean;
  canAccess: (pathname: string) => boolean;
}

// User with role type (extends Supabase User metadata)
export interface UserWithRole {
  id: string;
  email?: string;
  user_metadata: {
    role?: Role;
    full_name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
}

// Guard component props
export interface RoleGuardProps {
  children: React.ReactNode;
  roles: Role | Role[];
  fallback?: React.ReactNode;
}

export interface PermissionGuardProps {
  children: React.ReactNode;
  permission: Permission;
  fallback?: React.ReactNode;
}
