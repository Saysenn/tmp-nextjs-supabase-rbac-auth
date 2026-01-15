# Role-Based Access Control (RBAC) Documentation

This document provides a comprehensive guide to using the Role-Based Access Control system in this Next.js + Supabase boilerplate.

## Overview

The RBAC system provides enterprise-grade access control with a **single-file configuration** approach. Everything you need to customize is in one file: `lib/rbac/config.ts`.

## Quick Start

### 1. Define Your Roles

Edit `lib/rbac/config.ts`:

```typescript
export const ROLES = {
  ADMIN: 'admin',     // Full system access
  AGENT: 'agent',     // Operational access
  USER: 'user',       // Standard user access
} as const;
```

### 2. Set Role Hierarchy

Define which roles have more privileges:

```typescript
export const ROLE_HIERARCHY: Record<string, number> = {
  [ROLES.ADMIN]: 100,   // Highest
  [ROLES.AGENT]: 50,    // Middle
  [ROLES.USER]: 10,     // Lowest
};
```

### 3. Define Route Access

Specify which roles can access which routes:

```typescript
export const ROUTE_ACCESS: Record<string, readonly string[]> = {
  '/dashboard/admin': [ROLES.ADMIN],
  '/dashboard/analytics': [ROLES.ADMIN, ROLES.AGENT],
  '/dashboard/settings': [ROLES.ADMIN, ROLES.AGENT, ROLES.USER],
  '/dashboard': [ROLES.ADMIN, ROLES.AGENT, ROLES.USER],
};
```

### 4. Define Permissions

Create granular permissions for feature-level access:

```typescript
export const PERMISSIONS = {
  'users:read': [ROLES.ADMIN, ROLES.AGENT],
  'users:write': [ROLES.ADMIN],
  'users:delete': [ROLES.ADMIN],
  'content:read': [ROLES.ADMIN, ROLES.AGENT, ROLES.USER],
  'content:write': [ROLES.ADMIN, ROLES.AGENT],
} as const;
```

## File Structure

```
lib/rbac/
├── config.ts        # MAIN CONFIG FILE - Edit this to customize RBAC
├── types.ts         # TypeScript types (auto-inferred from config)
├── utils.ts         # Helper functions
└── index.ts         # Re-exports for clean imports

components/rbac/
├── RoleGuard.tsx    # Component to show/hide based on role
└── PermissionGuard.tsx  # Component to show/hide based on permission

hooks/
└── useRBAC.ts       # React hook for RBAC checks
```

## Assigning Roles to Users

Roles are stored in Supabase `user_metadata.role`. There are several ways to assign roles:

### Option 1: Supabase Dashboard (Manual)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Users**
3. Click on a user
4. Edit `raw_user_meta_data` JSON
5. Add or modify: `"role": "admin"`
6. Save changes

### Option 2: SQL Query

Run this in Supabase SQL Editor:

```sql
-- Assign admin role to a user
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'
WHERE email = 'admin@example.com';

-- Assign agent role
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "agent"}'
WHERE email = 'agent@example.com';

-- View all users with their roles
SELECT
  email,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
ORDER BY created_at DESC;
```

### Option 3: Admin API (Server-side)

Use the admin API route (`/api/admin/users`) or directly with Supabase Admin client:

```typescript
// Server-side only - requires SUPABASE_SERVICE_ROLE_KEY
import { updateUserRole } from '@/lib/supabase/admin-client';

const { data, error } = await updateUserRole(userId, 'agent');
```

### Option 4: Admin Dashboard UI

1. Sign in as an admin user
2. Navigate to `/dashboard/admin/users`
3. Find the user in the list
4. Use the role dropdown to change their role

## Using RBAC in Your Code

### Using the useRBAC Hook

```tsx
import { useRBAC } from '@/hooks/useRBAC';

function MyComponent() {
  const {
    role,           // Current user's role
    permissions,    // Array of user's permissions
    hasRole,        // Check if user has specific role(s)
    hasPermission,  // Check if user has specific permission
    isRoleAtLeast,  // Check role hierarchy
    canAccess       // Check route access
  } = useRBAC();

  // Check single role
  if (hasRole('admin')) {
    // Admin-only logic
  }

  // Check multiple roles
  if (hasRole(['admin', 'agent'])) {
    // Admin or agent logic
  }

  // Check permission
  if (hasPermission('users:delete')) {
    // Can delete users
  }

  // Check role hierarchy
  if (isRoleAtLeast('agent')) {
    // User is agent or higher (admin)
  }

  // Check route access
  if (canAccess('/dashboard/admin')) {
    // Can access admin dashboard
  }

  return <div>Your role: {role}</div>;
}
```

### Using Guard Components

#### RoleGuard

Show content only to users with specific roles:

```tsx
import { RoleGuard } from '@/components/rbac/RoleGuard';

// Single role
<RoleGuard role="admin">
  <AdminPanel />
</RoleGuard>

// Multiple roles
<RoleGuard roles={['admin', 'agent']}>
  <ManagementPanel />
</RoleGuard>

// With custom fallback
<RoleGuard
  roles={['admin']}
  fallback={<p>You need admin access to view this.</p>}
>
  <AdminSettings />
</RoleGuard>
```

#### PermissionGuard

Show content only to users with specific permissions:

```tsx
import { PermissionGuard } from '@/components/rbac/PermissionGuard';

<PermissionGuard permission="users:delete">
  <DeleteUserButton />
</PermissionGuard>

// With fallback
<PermissionGuard
  permission="reports:export"
  fallback={<p>Export feature not available for your role.</p>}
>
  <ExportButton />
</PermissionGuard>
```

## Route Protection

### Automatic Middleware Protection

The middleware (`middleware.ts`) automatically protects routes based on `ROUTE_ACCESS` config:

1. Unauthenticated users trying to access protected routes are redirected to `/auth/signin`
2. Authenticated users without proper role are redirected to `/unauthorized`
3. Routes are matched from most specific to least specific

### How Route Matching Works

```typescript
export const ROUTE_ACCESS = {
  '/dashboard/admin/settings': [ROLES.ADMIN],  // Most specific
  '/dashboard/admin': [ROLES.ADMIN],           // Less specific
  '/dashboard': [ROLES.ADMIN, ROLES.AGENT, ROLES.USER],  // Least specific
};
```

For a request to `/dashboard/admin/users`:
1. Checks `/dashboard/admin/settings` - no match
2. Checks `/dashboard/admin` - matches! Uses these roles
3. If user has `admin` role, access granted
4. If user has `agent` role, redirected to `/unauthorized`

## Default Settings

Configure these in `lib/rbac/config.ts`:

```typescript
// Role assigned to new users who sign up
export const DEFAULT_ROLE = ROLES.USER;

// Where to redirect after successful login
export const DEFAULT_REDIRECT = '/dashboard';

// Where to redirect users without proper role
export const UNAUTHORIZED_REDIRECT = '/unauthorized';

// Where to redirect unauthenticated users
export const LOGIN_REDIRECT = '/auth/signin';

// Routes that require authentication
export const PROTECTED_ROUTES = ['/dashboard'];

// Routes that redirect authenticated users away
export const AUTH_ROUTES = ['/auth/signin', '/auth/signup'];

// Public routes accessible to everyone
export const PUBLIC_ROUTES = ['/', '/about', '/contact', '/auth/callback'];
```

## Customizing for Your Project

### Adding New Roles

1. Add to `ROLES` object:
```typescript
export const ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  USER: 'user',
  MODERATOR: 'moderator',  // New role
} as const;
```

2. Add to `ROLE_HIERARCHY`:
```typescript
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 100,
  [ROLES.MODERATOR]: 60,  // Between admin and agent
  [ROLES.AGENT]: 50,
  [ROLES.USER]: 10,
};
```

3. Update `PERMISSIONS` and `ROUTE_ACCESS` as needed.

### Adding New Permissions

```typescript
export const PERMISSIONS = {
  // Existing permissions...

  // New feature permissions
  'billing:view': [ROLES.ADMIN, ROLES.AGENT],
  'billing:manage': [ROLES.ADMIN],
  'support:tickets': [ROLES.ADMIN, ROLES.AGENT, ROLES.MODERATOR],
} as const;
```

### Adding New Protected Routes

```typescript
export const ROUTE_ACCESS = {
  // Existing routes...

  // New routes
  '/dashboard/billing': [ROLES.ADMIN, ROLES.AGENT],
  '/dashboard/support': [ROLES.ADMIN, ROLES.AGENT, ROLES.MODERATOR],
} as const;
```

## Security Model

### Defense in Depth

The RBAC system uses two layers of protection:

1. **Server-side (Middleware)**: Routes are protected at the middleware level. This is the primary security layer and cannot be bypassed by the client.

2. **Client-side (Guards)**: UI elements are hidden/shown based on roles. This provides better UX but should never be relied upon for security.

### Important Security Notes

- **Never trust client-side checks alone** - Always verify roles server-side
- **Roles are set by admins** - Users cannot set their own role during signup
- **Service role key is secret** - Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- **Session refresh** - The middleware refreshes sessions on every request
- **Role changes require re-login** - After an admin changes a user's role, the user must sign out and sign back in

## Environment Variables

Required for RBAC admin features:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Required for admin API (role management)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Keep this secret!
```

Get the service role key from:
1. Supabase Dashboard > Settings > API
2. Under "Project API keys", find "service_role" (secret)

**Warning**: Never expose the service role key to the client. It bypasses Row Level Security.

## API Routes

### GET /api/admin/users

List all users with their roles.

**Requires**: Admin role

**Response**:
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "user",
      "full_name": "John Doe",
      "created_at": "2024-01-01T00:00:00Z",
      "email_confirmed_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "perPage": 50
}
```

### PATCH /api/admin/users

Update a user's role.

**Requires**: Admin role

**Request**:
```json
{
  "userId": "user-uuid",
  "role": "agent"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "agent"
  }
}
```

### DELETE /api/admin/users?userId=xxx

Delete a user.

**Requires**: Admin role

**Response**:
```json
{
  "success": true
}
```

## Troubleshooting

### User can't access a route they should have access to

1. Check the user's role in Supabase Dashboard
2. Verify `ROUTE_ACCESS` config includes their role for that route
3. Have the user sign out and sign back in to refresh their session

### Role changes not taking effect

After changing a user's role:
1. The user must sign out
2. Sign back in to get a new session with updated role
3. Sessions are not updated in real-time for security

### "Access Denied" even though role is set

1. Check browser dev tools > Application > Cookies
2. Clear all cookies for the site
3. Sign in again
4. Check that `user_metadata.role` is set correctly in Supabase

### Admin dashboard not loading users

1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
2. Check the server console for errors
3. Verify your admin user has the `admin` role

## Best Practices

1. **Start with minimal roles** - Add roles as needed rather than creating many upfront
2. **Use permissions for features** - Roles for route access, permissions for feature access
3. **Document role responsibilities** - Keep a record of what each role can do
4. **Regular audits** - Periodically review user roles and permissions
5. **Least privilege principle** - Give users the minimum role they need
6. **Test role changes** - Always test role-based features before deploying

## Example: Complete Setup

Here's a complete example of setting up RBAC for a SaaS application:

```typescript
// lib/rbac/config.ts

export const ROLES = {
  ADMIN: 'admin',       // Platform administrators
  AGENT: 'agent',       // Support/sales agents
  USER: 'user',         // Regular customers
} as const;

export const ROLE_HIERARCHY: Record<string, number> = {
  [ROLES.ADMIN]: 100,
  [ROLES.AGENT]: 50,
  [ROLES.USER]: 10,
};

export const PERMISSIONS = {
  // User management
  'users:read': [ROLES.ADMIN, ROLES.AGENT],
  'users:write': [ROLES.ADMIN],
  'users:delete': [ROLES.ADMIN],

  // Dashboard
  'dashboard:view': [ROLES.ADMIN, ROLES.AGENT, ROLES.USER],
  'dashboard:analytics': [ROLES.ADMIN, ROLES.AGENT],
  'dashboard:settings': [ROLES.ADMIN],

  // Content
  'content:read': [ROLES.ADMIN, ROLES.AGENT, ROLES.USER],
  'content:write': [ROLES.ADMIN, ROLES.AGENT],
  'content:publish': [ROLES.ADMIN],
  'content:delete': [ROLES.ADMIN],
} as const;

export const ROUTE_ACCESS: Record<string, readonly string[]> = {
  '/dashboard/admin': [ROLES.ADMIN],
  '/dashboard/analytics': [ROLES.ADMIN, ROLES.AGENT],
  '/dashboard/settings': [ROLES.ADMIN, ROLES.AGENT, ROLES.USER],
  '/dashboard': [ROLES.ADMIN, ROLES.AGENT, ROLES.USER],
};

export const DEFAULT_ROLE = ROLES.USER;
```

This setup provides:
- Admins: Full access to everything
- Agents: Can view users, access analytics, manage content
- Users: Basic dashboard access, can read content
