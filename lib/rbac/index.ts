// Configuration
export {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  ROUTE_ACCESS,
  DEFAULT_ROLE,
  DEFAULT_REDIRECT,
  UNAUTHORIZED_REDIRECT,
  LOGIN_REDIRECT,
  PROTECTED_ROUTES,
  AUTH_ROUTES,
  PUBLIC_ROUTES,
} from './config';

// Types
export type {
  RoleName,
  Permission,
  RouteAccessConfig,
  RBACContext,
  UserWithRoles,
  RoleGuardProps,
  PermissionGuardProps,
} from './types';

// Utility functions
export {
  getUserRoles,
  getUserPermissions,
  hasRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isRoleAtLeast,
  canAccessRoute,
  getAllRoles,
  getRolePermissions,
  isValidRole,
  getRoleDisplayName,
  isProtectedRoute,
  isAuthRoute,
} from './utils';
