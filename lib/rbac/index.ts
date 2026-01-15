// Configuration
export {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  ROUTE_ACCESS,
  DEFAULT_ROLE,
  DEFAULT_REDIRECT,
  UNAUTHORIZED_REDIRECT,
  PENDING_REDIRECT,
  LOGIN_REDIRECT,
  PROTECTED_ROUTES,
  AUTH_ROUTES,
  PUBLIC_ROUTES,
} from './config';

// Types
export type {
  Role,
  Permission,
  RouteAccessConfig,
  RBACContext,
  UserWithRole,
  RoleGuardProps,
  PermissionGuardProps,
} from './types';

// Utility functions
export {
  getRoleLevel,
  hasRole,
  isRoleAtLeast,
  hasPermission,
  getPermissionsForRole,
  canAccessRoute,
  getRoleFromUser,
  isProtectedRoute,
  isAuthRoute,
  getAllRoles,
  isValidRole,
} from './utils';
