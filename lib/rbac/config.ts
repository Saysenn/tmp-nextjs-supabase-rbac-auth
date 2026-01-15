/**
 * =============================================================================
 * ROLE-BASED ACCESS CONTROL (RBAC) CONFIGURATION
 * =============================================================================
 *
 * This is your CENTRALIZED configuration file for role-based authentication.
 * Modify this file to customize roles, permissions, and route access for your project.
 *
 * HOW TO USE:
 * 1. Define your roles in ROLES object
 * 2. Set role hierarchy levels in ROLE_HIERARCHY (higher = more access)
 * 3. Define permissions and which roles have them in PERMISSIONS
 * 4. Define route access rules in ROUTE_ACCESS
 *
 * =============================================================================
 */

// -----------------------------------------------------------------------------
// ROLES CONFIGURATION
// -----------------------------------------------------------------------------
// Define all roles available in your application.
// Add or remove roles as needed for your project.

export const ROLES = {
  ADMIN: 'admin',     // Full system access, user management
  AGENT: 'agent',     // Operational access, can manage content
  USER: 'user',       // Standard user access
} as const;

// -----------------------------------------------------------------------------
// ROLE HIERARCHY
// -----------------------------------------------------------------------------
// Define the hierarchy level for each role.
// Higher number = more privileges.
// Used for "isRoleAtLeast" comparisons.

export const ROLE_HIERARCHY: Record<string, number> = {
  [ROLES.ADMIN]: 100,
  [ROLES.AGENT]: 50,
  [ROLES.USER]: 10,
};

// -----------------------------------------------------------------------------
// PERMISSIONS CONFIGURATION
// -----------------------------------------------------------------------------
// Define granular permissions and which roles have them.
// Format: 'permission:action': ['role1', 'role2', ...]
//
// Naming convention: 'resource:action'
// Examples: 'users:read', 'users:write', 'users:delete', 'reports:export'

export const PERMISSIONS = {
  // User Management
  'users:read': [ROLES.ADMIN, ROLES.AGENT],
  'users:write': [ROLES.ADMIN],
  'users:delete': [ROLES.ADMIN],

  // Dashboard Access
  'dashboard:view': [ROLES.ADMIN, ROLES.AGENT, ROLES.USER],
  'dashboard:analytics': [ROLES.ADMIN, ROLES.AGENT],
  'dashboard:settings': [ROLES.ADMIN],

  // Admin Panel
  'admin:access': [ROLES.ADMIN],
  'admin:system-settings': [ROLES.ADMIN],

  // Reports
  'reports:view': [ROLES.ADMIN, ROLES.AGENT],
  'reports:export': [ROLES.ADMIN],
  'reports:delete': [ROLES.ADMIN],

  // Content Management
  'content:read': [ROLES.ADMIN, ROLES.AGENT, ROLES.USER],
  'content:write': [ROLES.ADMIN, ROLES.AGENT],
  'content:publish': [ROLES.ADMIN],
  'content:delete': [ROLES.ADMIN],
} as const;

// -----------------------------------------------------------------------------
// ROUTE ACCESS CONFIGURATION
// -----------------------------------------------------------------------------
// Define which roles can access which routes.
// Routes are matched from most specific to least specific.
//
// Note: Routes without a trailing /* will also match all sub-routes by default.
// For example: '/dashboard' matches '/dashboard', '/dashboard/settings', etc.

export const ROUTE_ACCESS: Record<string, readonly string[]> = {
  // Admin routes - restricted to admin only
  '/dashboard/admin': [ROLES.ADMIN],

  // Analytics - admin and agents
  '/dashboard/analytics': [ROLES.ADMIN, ROLES.AGENT],

  // Settings - all authenticated users can access their own settings
  '/dashboard/settings': [ROLES.ADMIN, ROLES.AGENT, ROLES.USER],

  // General dashboard - all authenticated users
  '/dashboard': [ROLES.ADMIN, ROLES.AGENT, ROLES.USER],
};

// -----------------------------------------------------------------------------
// DEFAULT SETTINGS
// -----------------------------------------------------------------------------

// Default role assigned to new users (when no role is specified)
export const DEFAULT_ROLE = ROLES.USER;

// Where to redirect pending users (kept for backwards compatibility)
export const PENDING_REDIRECT = '/dashboard';

// Where to redirect users after successful login
export const DEFAULT_REDIRECT = '/dashboard';

// Where to redirect users who lack permission for a route
export const UNAUTHORIZED_REDIRECT = '/unauthorized';

// Where to redirect unauthenticated users trying to access protected routes
export const LOGIN_REDIRECT = '/auth/signin';

// Routes that require authentication but no specific role
export const PROTECTED_ROUTES = ['/dashboard'];

// Routes that should redirect authenticated users away (e.g., login page)
export const AUTH_ROUTES = ['/auth/signin', '/auth/signup'];

// Public routes that anyone can access (no auth required)
export const PUBLIC_ROUTES = ['/', '/about', '/contact', '/auth/callback'];
