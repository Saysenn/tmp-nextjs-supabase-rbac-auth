# Role-Based Access Control (RBAC) Documentation

This document provides a comprehensive guide to using the Role-Based Access Control system in this Next.js + Supabase boilerplate.

## Overview

The RBAC system uses a **Set-based permission model** with a **single-file configuration**. Each role has a Set of permissions for fast O(1) lookup. Users can have **multiple roles**, and their permissions are combined.

**Key Features:**
- Single config file for all roles and permissions
- Set-based permissions for fast lookups
- Support for multiple roles per user
- Route-level and component-level access control
- TypeScript-first with auto-generated types

## Quick Start

### 1. Define Your Permissions

Edit `lib/rbac/config.ts`:

```typescript
export const PERMISSIONS = [
  // User Management
  'User:Read',
  'User:Write',
  'User:Update',
  'User:Delete',

  // Dashboard
  'Dashboard:View',
  'Dashboard:Analytics',

  // Your custom permissions
  'Order:Create',
  'Order:View',
  'Order:Cancel',
] as const;
```

### 2. Define Roles with Permissions

Each role is a Set of permissions:

```typescript
export const ROLES = {
  ADMIN: new Set([
    'User:Read',
    'User:Write',
    'User:Update',
    'User:Delete',
    'Dashboard:View',
    'Dashboard:Analytics',
    'Order:Create',
    'Order:View',
    'Order:Cancel',
  ]),

  AGENT: new Set([
    'User:Read',
    'Dashboard:View',
    'Dashboard:Analytics',
    'Order:Create',
    'Order:View',
  ]),

  USER: new Set([
    'Dashboard:View',
    'Order:Create',
    'Order:View',
  ]),
} as const;
```

### 3. Define Route Access

Specify which roles can access which routes:

```typescript
export const ROUTE_ACCESS: Record<string, string[]> = {
  '/dashboard/admin': ['ADMIN'],
  '/dashboard/analytics': ['ADMIN', 'AGENT'],
  '/dashboard/settings': ['ADMIN', 'AGENT', 'USER'],
  '/dashboard': ['ADMIN', 'AGENT', 'USER'],
};
```

## File Structure

```
lib/rbac/
├── config.ts        # MAIN CONFIG FILE - All roles, permissions, routes
├── types.ts         # TypeScript types (auto-inferred)
├── utils.ts         # Helper functions
└── index.ts         # Re-exports

components/rbac/
├── RoleGuard.tsx    # Show/hide based on role
└── PermissionGuard.tsx  # Show/hide based on permission

hooks/
└── useRBAC.ts       # React hook for RBAC
```

## How Permissions Work

### Set-Based Model

```typescript
// Each role has a Set of permissions
const ROLES = {
  ADMIN: new Set(['User:Read', 'User:Write', 'User:Delete']),
  AGENT: new Set(['User:Read']),
};

// Check if user has permission (O(1) lookup)
ROLES.ADMIN.has('User:Delete');  // true
ROLES.AGENT.has('User:Delete');  // false
```

### Multiple Roles

Users can have multiple roles. Permissions are combined:

```typescript
// User with both AGENT and USER roles
const user = { roles: ['AGENT', 'USER'] };

// User gets permissions from BOTH roles
// If AGENT has 'Report:View' and USER has 'Order:Create'
// User can access both 'Report:View' AND 'Order:Create'
```

## Assigning Roles to Users

Roles are stored in Supabase `user_metadata.role`. Can be a string or array.

### Single Role (String)

```json
{
  "role": "ADMIN"
}
```

### Multiple Roles (Array)

```json
{
  "role": ["ADMIN", "AGENT"]
}
```

### Supabase SQL

```sql
-- Assign single role
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "ADMIN"}'
WHERE email = 'admin@example.com';

-- Assign multiple roles
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": ["ADMIN", "AGENT"]}'
WHERE email = 'power-user@example.com';

-- View all users with roles
SELECT
  email,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
ORDER BY created_at DESC;
```

### Admin Dashboard

1. Sign in as admin
2. Go to `/dashboard/admin/users`
3. Use the dropdown to change user roles

## Using RBAC in Your Code

### useRBAC Hook

```tsx
import { useRBAC } from '@/hooks/useRBAC';

function MyComponent() {
  const {
    roles,             // Array of user's roles: ['ADMIN', 'AGENT']
    permissions,       // Array of all permissions from all roles
    hasRole,           // Check role(s)
    hasPermission,     // Check single permission
    hasAnyPermission,  // Check if user has ANY of given permissions
    hasAllPermissions, // Check if user has ALL of given permissions
    isRoleAtLeast,     // Check role hierarchy
    canAccess,         // Check route access
  } = useRBAC();

  // Check single role
  if (hasRole('ADMIN')) {
    // Admin only
  }

  // Check multiple roles (user needs ANY)
  if (hasRole(['ADMIN', 'AGENT'])) {
    // Admin OR Agent
  }

  // Check single permission
  if (hasPermission('User:Delete')) {
    // Can delete users
  }

  // Check multiple permissions (ANY)
  if (hasAnyPermission(['Report:View', 'Report:Export'])) {
    // Can view OR export reports
  }

  // Check multiple permissions (ALL)
  if (hasAllPermissions(['User:Read', 'User:Write'])) {
    // Must have BOTH permissions
  }

  // Check route access
  if (canAccess('/dashboard/admin')) {
    // Can access admin dashboard
  }

  return <div>Roles: {roles.join(', ')}</div>;
}
```

### RoleGuard Component

```tsx
import { RoleGuard } from '@/components/rbac/RoleGuard';

// Single role
<RoleGuard role="ADMIN">
  <AdminPanel />
</RoleGuard>

// Multiple roles (user needs ANY)
<RoleGuard roles={['ADMIN', 'AGENT']}>
  <ManagementPanel />
</RoleGuard>

// With fallback
<RoleGuard role="ADMIN" fallback={<p>Access denied</p>}>
  <AdminSettings />
</RoleGuard>
```

### PermissionGuard Component

```tsx
import { PermissionGuard } from '@/components/rbac/PermissionGuard';

// Single permission
<PermissionGuard permission="User:Delete">
  <DeleteButton />
</PermissionGuard>

// Multiple permissions - user needs ANY
<PermissionGuard permissions={['Report:View', 'Report:Export']}>
  <ReportSection />
</PermissionGuard>

// Multiple permissions - user needs ALL
<PermissionGuard permissions={['User:Read', 'User:Write']} requireAll>
  <UserEditor />
</PermissionGuard>

// With fallback
<PermissionGuard permission="Report:Export" fallback={<UpgradePrompt />}>
  <ExportButton />
</PermissionGuard>
```

## Route Protection

### Automatic Middleware Protection

The middleware (`middleware.ts`) automatically protects routes based on `ROUTE_ACCESS`:

1. Unauthenticated users → redirect to `/auth/signin`
2. Users without proper role → redirect to `/unauthorized`
3. Routes matched from most specific to least specific

### Route Matching

```typescript
export const ROUTE_ACCESS = {
  '/dashboard/admin/settings': ['ADMIN'],      // Most specific
  '/dashboard/admin': ['ADMIN'],               // Less specific
  '/dashboard': ['ADMIN', 'AGENT', 'USER'],    // Least specific
};
```

For `/dashboard/admin/users`:
1. Checks `/dashboard/admin/settings` - no match
2. Checks `/dashboard/admin` - matches! Requires ADMIN
3. User with ADMIN role → access granted
4. User with AGENT role → redirect to `/unauthorized`

## Adding New Roles

### Step 1: Add to PERMISSIONS (if needed)

```typescript
export const PERMISSIONS = [
  // ... existing
  'Billing:View',
  'Billing:Manage',
] as const;
```

### Step 2: Add to ROLES

```typescript
export const ROLES = {
  ADMIN: new Set([/* ... */]),
  AGENT: new Set([/* ... */]),
  USER: new Set([/* ... */]),

  // New role
  BILLING_ADMIN: new Set([
    'Dashboard:View',
    'Billing:View',
    'Billing:Manage',
  ]),
} as const;
```

### Step 3: Add to ROLE_HIERARCHY

```typescript
export const ROLE_HIERARCHY: Record<string, number> = {
  ADMIN: 100,
  BILLING_ADMIN: 75,  // New
  AGENT: 50,
  USER: 10,
};
```

### Step 4: Update ROUTE_ACCESS (if needed)

```typescript
export const ROUTE_ACCESS = {
  '/dashboard/billing': ['ADMIN', 'BILLING_ADMIN'],
  // ... rest
};
```

That's it! The new role is automatically available throughout the app.

## Default Settings

```typescript
// Role for new users
export const DEFAULT_ROLE = 'USER';

// Redirects
export const DEFAULT_REDIRECT = '/dashboard';
export const UNAUTHORIZED_REDIRECT = '/unauthorized';
export const LOGIN_REDIRECT = '/auth/signin';

// Route types
export const PROTECTED_ROUTES = ['/dashboard'];
export const AUTH_ROUTES = ['/auth/signin', '/auth/signup'];
export const PUBLIC_ROUTES = ['/', '/about', '/auth/callback'];
```

## Security

### Defense in Depth

1. **Server-side (Middleware)**: Primary security layer - cannot be bypassed
2. **Client-side (Guards)**: Better UX - never rely on alone

### Important Notes

- Never trust client-side checks alone
- Users cannot set their own role
- Service role key is secret (server-only)
- Role changes require re-login to take effect

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Secret!
```

## API Routes

### GET /api/admin/users

List all users. Requires: ADMIN role.

### PATCH /api/admin/users

Update user role.

```json
{
  "userId": "user-uuid",
  "role": "AGENT"
}
```

### DELETE /api/admin/users?userId=xxx

Delete a user. Requires: ADMIN role.

## Complete Example

```typescript
// lib/rbac/config.ts

export const PERMISSIONS = [
  'User:Read', 'User:Write', 'User:Delete',
  'Order:Create', 'Order:View', 'Order:Cancel',
  'Report:View', 'Report:Export',
  'Admin:Access',
] as const;

export const ROLES = {
  ADMIN: new Set([
    'User:Read', 'User:Write', 'User:Delete',
    'Order:Create', 'Order:View', 'Order:Cancel',
    'Report:View', 'Report:Export',
    'Admin:Access',
  ]),

  AGENT: new Set([
    'User:Read',
    'Order:Create', 'Order:View', 'Order:Cancel',
    'Report:View',
  ]),

  USER: new Set([
    'Order:Create', 'Order:View',
  ]),
} as const;

export const ROLE_HIERARCHY = {
  ADMIN: 100,
  AGENT: 50,
  USER: 10,
};

export const ROUTE_ACCESS = {
  '/dashboard/admin': ['ADMIN'],
  '/dashboard/reports': ['ADMIN', 'AGENT'],
  '/dashboard': ['ADMIN', 'AGENT', 'USER'],
};

export const DEFAULT_ROLE = 'USER';
```

## Troubleshooting

### User can't access route they should have access to

1. Check user's role in Supabase
2. Verify ROUTE_ACCESS includes their role
3. Have user sign out and back in

### Role changes not taking effect

User must sign out and sign back in.

### "Access Denied" with correct role

1. Clear browser cookies
2. Sign in again
3. Verify `user_metadata.role` in Supabase

### Admin dashboard not loading

1. Check SUPABASE_SERVICE_ROLE_KEY is set
2. Check server console for errors
3. Verify your user has ADMIN role
