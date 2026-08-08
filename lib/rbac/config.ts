/**
 * =============================================================================
 * ROLE-BASED ACCESS CONTROL (RBAC) CONFIGURATION
 * =============================================================================
 *
 * CENTRALIZED configuration for role-based authentication.
 * Edit this file to customize roles, permissions, and access rules.
 *
 * STRUCTURE:
 * - /dashboard/* - All authenticated users (USER, AGENT, ADMIN)
 * - /admin/* - Admin only pages
 *
 * =============================================================================
 */

// -----------------------------------------------------------------------------
// PERMISSIONS
// -----------------------------------------------------------------------------
// Define all available permissions. Format: "Resource:Action"

export const PERMISSIONS = [
  // User Management
  'User:Read',
  'User:Write',
  'User:Update',
  'User:Delete',

  // Dashboard
  'Dashboard:View',
  'Dashboard:Analytics',
  'Dashboard:Settings',

  // Admin Panel
  'Admin:Access',
  'Admin:ManageUsers',
  'Admin:SystemSettings',

  // Reports
  'Report:View',
  'Report:Export',
  'Report:Delete',

  // Content Management
  'Content:Read',
  'Content:Write',
  'Content:Publish',
  'Content:Delete',
] as const;

// -----------------------------------------------------------------------------
// ROLES CONFIGURATION
// -----------------------------------------------------------------------------
// Each role has a Set of permissions for O(1) lookup.
// Users can have multiple roles - permissions are combined.

export const ROLES = {
  ADMIN: new Set([
    'User:Read',
    'User:Write',
    'User:Update',
    'User:Delete',
    'Dashboard:View',
    'Dashboard:Analytics',
    'Dashboard:Settings',
    'Admin:Access',
    'Admin:ManageUsers',
    'Admin:SystemSettings',
    'Report:View',
    'Report:Export',
    'Report:Delete',
    'Content:Read',
    'Content:Write',
    'Content:Publish',
    'Content:Delete',
  ]),

  AGENT: new Set([
    'User:Read',
    'Dashboard:View',
    'Dashboard:Analytics',
    'Report:View',
    'Report:Export',
    'Content:Read',
    'Content:Write',
    'Content:Publish',
  ]),

  USER: new Set([
    'Dashboard:View',
    'Content:Read',
  ]),
} as const;

// -----------------------------------------------------------------------------
// ROLE HIERARCHY
// -----------------------------------------------------------------------------
// Higher number = more privileges. Used for "isRoleAtLeast" checks.

export const ROLE_HIERARCHY: Record<string, number> = {
  ADMIN: 100,
  AGENT: 50,
  USER: 10,
};

// -----------------------------------------------------------------------------
// ROUTE ACCESS CONFIGURATION
// -----------------------------------------------------------------------------
// Which roles can access which routes.
// Routes without config = all authenticated users can access.

export const ROUTE_ACCESS: Record<string, string[]> = {
  // Admin routes - ADMIN only
  '/admin': ['ADMIN'],
  '/admin/users': ['ADMIN'],
  '/admin/settings': ['ADMIN'],

  // Dashboard routes - all authenticated users
  '/dashboard': ['ADMIN', 'AGENT', 'USER'],
  '/dashboard/analytics': ['ADMIN', 'AGENT'],
  '/dashboard/settings': ['ADMIN', 'AGENT', 'USER'],
};

// -----------------------------------------------------------------------------
// ROUTE CONFIGURATION
// -----------------------------------------------------------------------------

// Default role for new users
export const DEFAULT_ROLE = 'USER';

// Redirect destinations
export const DEFAULT_REDIRECT = '/dashboard';
export const UNAUTHORIZED_REDIRECT = '/unauthorized';
export const LOGIN_REDIRECT = '/auth/signin';

// Protected routes (require authentication)
export const PROTECTED_ROUTES = ['/dashboard', '/admin'];

// Auth routes (redirect authenticated users away)
export const AUTH_ROUTES = ['/auth/signin', '/auth/signup'];

// Public routes (no auth required)
export const PUBLIC_ROUTES = ['/', '/about', '/contact', '/auth/callback', '/unauthorized'];

// -----------------------------------------------------------------------------
// HELPER TYPES
// -----------------------------------------------------------------------------

export type Permission = (typeof PERMISSIONS)[number];
export type RoleName = keyof typeof ROLES;
