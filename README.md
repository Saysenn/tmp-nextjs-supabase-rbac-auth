# Next.js 16 + Supabase Authentication Template

A production-ready authentication template built with Next.js 16 and Supabase, featuring email/password authentication, Google OAuth, two-factor authentication (2FA), and comprehensive user management.

## Features

### Authentication & Security
- Email/password authentication with email verification
- Google OAuth integration
- Two-factor authentication (2FA) with TOTP
- **Role-Based Access Control (RBAC)** - Enterprise-grade, single-file configuration
- Protected routes with middleware (authentication + authorization)
- Automatic session management and refresh
- Secure cookie-based sessions

### User Management
- User dashboard
- Profile management (name, email, password)
- Security settings page
- Account information display

### Developer Experience
- TypeScript throughout
- Server-side rendering (SSR) with Next.js 16
- Tailwind CSS for styling
- Type-safe API calls
- Clean code architecture
- Comprehensive documentation

## Tech Stack

- **Framework:** Next.js 16.1.1
- **Authentication:** Supabase (@supabase/ssr ^0.8.0)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Data Fetching:** TanStack Query ^5.90.16

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Supabase account (free tier works)
- A Google Cloud Console account (for OAuth)

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd propann
npm install
```

### 2. Set Up Supabase

#### Create a Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be created

#### Get Your Supabase Credentials
1. In your project dashboard, go to **Settings** → **API**
2. Copy your **Project URL**
3. Copy your **anon/public key**

#### Configure Authentication Settings
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Configure email templates if desired

#### Set Up URL Configuration
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL:**
   - Development: `http://localhost:3000`
   - Production: Your production URL
3. Add **Redirect URLs:**
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (production)

### 3. Set Up Google OAuth

#### Create OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure the consent screen if prompted:
   - User Type: External (or Internal for workspace)
   - Fill in required fields
6. Application type: **Web application**
7. Add **Authorized redirect URIs:**
   ```
   https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
   ```
   Replace `YOUR_SUPABASE_PROJECT_ID` with your actual project ID
8. Click **Create**
9. Copy your **Client ID** and **Client Secret**

#### Configure Google OAuth in Supabase
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to expand
4. Toggle **Enable Google Provider**
5. Paste your **Client ID** (from Google Console)
6. Paste your **Client Secret** (from Google Console)
7. Click **Save**

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the values with your actual Supabase credentials from Step 2.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
propann/
├── app/
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts          # OAuth callback handler
│   │   ├── signin/
│   │   │   └── page.tsx          # Sign-in page
│   │   └── signup/
│   │       └── page.tsx          # Sign-up page
│   ├── dashboard/
│   │   ├── page.tsx              # Main dashboard
│   │   ├── profile/
│   │   │   └── page.tsx          # Profile management
│   │   └── security/
│   │       └── page.tsx          # 2FA settings
│   └── layout.tsx                # Root layout with providers
├── components/                    # Reusable components
├── context/
│   └── UserContext.tsx           # User authentication context
├── hooks/
│   ├── useSupabaseUser.ts        # Auth state hook
│   └── useRBAC.ts                # Role-based access control hook
├── lib/
│   ├── auth.ts                   # Auth helper functions
│   ├── rbac/                     # Role-Based Access Control
│   │   ├── config.ts             # ⭐ EDIT THIS - Roles, permissions, routes
│   │   ├── types.ts              # TypeScript types
│   │   ├── utils.ts              # Helper functions
│   │   └── index.ts              # Re-exports
│   └── supabase/
│       ├── browser-client.ts     # Browser Supabase client
│       └── server-client.ts      # Server Supabase client
├── components/
│   └── rbac/                     # RBAC guard components
│       ├── RoleGuard.tsx         # Role-based rendering
│       └── PermissionGuard.tsx   # Permission-based rendering
├── docs/
│   ├── done/                     # Completed features documentation
│   ├── in-progress/              # Current work documentation
│   └── plans/                    # Future enhancements
├── middleware.ts                 # Route protection & session refresh
└── .env.local                    # Environment variables (create this)
```

## Usage Guide

### Authentication Flow

#### Sign Up
1. Navigate to `/auth/signup`
2. Enter email and password, or click "Continue with Google"
3. For email signup: Check your email for verification link
4. Click verification link to activate account
5. Redirected to dashboard after verification

#### Sign In
1. Navigate to `/auth/signin`
2. Enter credentials or use Google OAuth
3. Automatically redirected to dashboard

#### Sign Out
1. Click "Sign Out" button in dashboard header
2. Session cleared and redirected to home page

### Dashboard Features

#### Profile Management
1. Go to Dashboard → Profile Settings
2. Update your full name
3. Change email (requires verification)
4. Change password (requires current password)

#### Two-Factor Authentication
1. Go to Dashboard → Security & 2FA
2. Click "Enable Two-Factor Authentication"
3. Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
4. Enter 6-digit verification code
5. 2FA is now enabled for your account

To disable 2FA:
1. Go to Security & 2FA page
2. Click "Disable Two-Factor Authentication"
3. Confirm the action

## Role-Based Access Control (RBAC)

This template includes a comprehensive, enterprise-grade role-based authentication system. **Everything is controlled from ONE file:** `lib/rbac/config.ts`.

### Quick Start - Adding Roles to Your Project

**Step 1:** Edit `lib/rbac/config.ts` to define your roles:

```typescript
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  // Add your custom roles here
} as const;
```

**Step 2:** Define which roles can access which routes:

```typescript
export const ROUTE_ACCESS = {
  '/dashboard/admin': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  '/dashboard/reports': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER],
  '/dashboard': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
};
```

**Step 3:** Define granular permissions:

```typescript
export const PERMISSIONS = {
  'users:delete': [ROLES.SUPER_ADMIN],
  'users:write': [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  'reports:view': [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER],
};
```

**That's it!** The middleware automatically enforces route access, and you can use guards in components.

### Assigning Roles to Users

Roles are stored in Supabase `user_metadata`. Set them via:

**Option 1: Supabase Dashboard**
1. Go to Authentication → Users
2. Click on a user
3. Edit `raw_user_meta_data` and add `"role": "admin"`

**Option 2: SQL Query**
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'
WHERE email = 'admin@example.com';
```

**Option 3: Admin API (for programmatic assignment)**
```typescript
// Server-side only - use service_role key
const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
  user_metadata: { role: 'manager' }
});
```

### Using RBAC in Components

**Check permissions with the hook:**
```tsx
import { useRBAC } from '@/hooks/useRBAC';

function AdminPanel() {
  const { role, hasPermission, hasRole, canAccess } = useRBAC();

  if (!hasPermission('users:delete')) {
    return <p>You don't have permission to delete users.</p>;
  }

  return <DeleteUserButton />;
}
```

**Use guard components:**
```tsx
import { RoleGuard } from '@/components/rbac/RoleGuard';
import { PermissionGuard } from '@/components/rbac/PermissionGuard';

// Show only to specific roles
<RoleGuard roles={['admin', 'super_admin']}>
  <AdminSettings />
</RoleGuard>

// Show only to users with specific permission
<PermissionGuard permission="users:delete" fallback={<p>Access denied</p>}>
  <DeleteUserButton />
</PermissionGuard>
```

### RBAC Architecture

```
lib/rbac/
├── config.ts        # EDIT THIS FILE - All roles, permissions, routes
├── types.ts         # TypeScript types (auto-generated from config)
├── utils.ts         # Helper functions (hasRole, hasPermission, etc.)
└── index.ts         # Re-exports for clean imports

components/rbac/
├── RoleGuard.tsx    # Show/hide children based on role
└── PermissionGuard.tsx  # Show/hide children based on permission

hooks/
└── useRBAC.ts       # Hook for role/permission checks
```

### Security Model

1. **Server-side enforcement** - Middleware checks role on every request
2. **Client-side UX** - Guards hide UI elements users can't access
3. **Defense in depth** - Both layers work together
4. **No role spoofing** - Roles are set by admins, not users during signup
5. **Default role** - New users get `DEFAULT_ROLE` (configurable, defaults to `user`)

## Protected Routes

The following routes require authentication:
- `/dashboard` - Main dashboard
- `/dashboard/settings` - User settings
- `/dashboard/admin` - Admin only (admin, super_admin roles)
- `/dashboard/analytics` - Managers and above

Unauthenticated users are automatically redirected to `/auth/signin`.
Users without proper role are redirected to `/unauthorized`.

## Middleware

The middleware (`middleware.ts`) handles:
- Session refresh on every request
- Protecting dashboard routes
- Redirecting authenticated users away from auth pages
- Cookie management for auth tokens

## API Routes

### `/app/auth/callback/route.ts`
Handles OAuth callbacks from Google and other providers. Exchanges authorization codes for user sessions.

## Security

This template implements enterprise-grade security measures to protect user data and prevent common attacks.

### 🔒 Security Features

#### Authentication & Authorization
- **Password Requirements:** 8+ characters, uppercase, lowercase, numbers, special characters
- **Password Hashing:** Bcrypt via Supabase (never stored in plain text)
- **Two-Factor Authentication (2FA):** TOTP-based with QR code setup
- **OAuth Security:** Google OAuth with PKCE flow
- **Session Management:** HTTP-only cookies, automatic refresh
- **Protected Routes:** Middleware-level authorization

#### Security Headers (Configured)
- `Strict-Transport-Security` - HSTS with 2-year max-age
- `X-Frame-Options` - Clickjacking protection
- `X-Content-Type-Options` - MIME sniffing prevention
- `X-XSS-Protection` - Browser XSS protection
- `Referrer-Policy` - Referrer information control
- `Permissions-Policy` - Disable unnecessary browser features

#### Input Validation & Sanitization
- Email validation (RFC 5322 compliant)
- Password strength validation with scoring
- Input sanitization (removes null bytes, control characters)
- HTML escaping to prevent XSS
- Full name validation with international character support
- Maximum length limits to prevent DOS attacks

#### Protection Against OWASP Top 10
- ✅ Injection Attacks (parameterized queries, input sanitization)
- ✅ Broken Authentication (strong passwords, 2FA, secure sessions)
- ✅ Sensitive Data Exposure (HTTPS, encrypted passwords, secure cookies)
- ✅ Broken Access Control (middleware protection, server-side validation)
- ✅ Security Misconfiguration (security headers, environment variables)
- ✅ Cross-Site Scripting (React protection, HTML sanitization)
- ⚠️ Rate Limiting (Supabase built-in, additional recommended)

### 📚 Security Documentation

Comprehensive security documentation is available:
- **[/docs/done/security.md](docs/done/security.md)** - Complete security implementation details
- Security checklist for pre-deployment
- OWASP Top 10 coverage analysis
- Monitoring and incident response guidelines

### 🛡️ Security Best Practices

**For Development:**
- Never commit `.env.local` to version control
- Use different Supabase projects for dev/staging/prod
- Keep dependencies updated
- Review Supabase auth logs regularly

**For Production:**
- Enable email verification in Supabase
- Configure rate limiting (Vercel/Upstash recommended)
- Set up monitoring and alerting
- Implement logging service (Sentry, LogRocket)
- Rotate API keys periodically
- Enable 2FA for admin accounts
- Regular security audits

**Password Requirements (Enforced):**
- Minimum 8 characters (recommended: 12+)
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Not in common passwords list

### 🔐 Environment Variables Security

```bash
# .env.local (never commit this file)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key  # Safe to expose (public key)
```

**Note:** The Supabase anon key is safe to expose publicly. It's protected by Row Level Security (RLS) policies.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Update Supabase URL Configuration:
   - Add your Vercel domain to **Site URL**
   - Add `https://yourdomain.com/auth/callback` to **Redirect URLs**
5. Update Google OAuth:
   - Add `https://yourdomain.com` to authorized JavaScript origins
   - Redirect URIs remain the same (Supabase URL)
6. Deploy

### Other Platforms

This template works on any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render
- Self-hosted

Ensure environment variables are set and redirect URLs are configured properly.

## Troubleshooting

### Common Issues

#### "Invalid login credentials" on sign-in
- Verify email is confirmed (check inbox/spam)
- Ensure password is correct
- Check Supabase auth logs in dashboard

#### Google OAuth not working
- Verify redirect URI matches exactly in Google Console
- Check that Client ID and Secret are correct in Supabase
- Ensure Google provider is enabled in Supabase

#### "User not found" errors
- Clear browser cookies and cache
- Check middleware configuration
- Verify Supabase environment variables

#### 2FA QR code not loading
- Check browser console for errors
- Verify Supabase connection
- Try refreshing the page

#### Redirects not working
- Check middleware.ts configuration
- Verify protected routes array
- Clear Next.js cache: `rm -rf .next`

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[/docs/done/authentication.md](docs/done/authentication.md)** - Completed features
- **[/docs/in-progress/current-work.md](docs/in-progress/current-work.md)** - Current work
- **[/docs/plans/future-enhancements.md](docs/plans/future-enhancements.md)** - Future plans

## Testing

### Manual Testing Checklist

- [ ] Sign up with email/password
- [ ] Verify email and sign in
- [ ] Sign in with Google OAuth
- [ ] Sign out
- [ ] Access protected route (should redirect to sign-in)
- [ ] Try to access auth pages while signed in (should redirect to dashboard)
- [ ] Update profile information
- [ ] Change email address
- [ ] Change password
- [ ] Enable 2FA
- [ ] Sign out and sign in with 2FA
- [ ] Disable 2FA

## Customization

### Styling
- Modify Tailwind classes in components
- Update `tailwind.config.ts` for theme changes
- Colors, fonts, and spacing can be customized

### Branding
- Replace logo in header
- Update favicon and metadata in `app/layout.tsx`
- Customize email templates in Supabase dashboard

### Adding Features
See [/docs/plans/future-enhancements.md](docs/plans/future-enhancements.md) for ideas:
- Password reset flow
- Additional OAuth providers
- Session management
- Magic link authentication
- And more...

## Using as a Template

This project is designed to be used as a template for future projects:

1. **Fork or Clone** this repository
2. **Remove** any project-specific code
3. **Customize** branding, colors, and styling
4. **Add** your application-specific features
5. **Deploy** to your platform of choice

The authentication system is complete and production-ready, allowing you to focus on building your application's core features.

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review documentation in `/docs`
- Check [Supabase Documentation](https://supabase.com/docs)
- Check [Next.js Documentation](https://nextjs.org/docs)

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend and authentication
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [TanStack Query](https://tanstack.com/query) - Data fetching

---

Built with ❤️ using Next.js 16 and Supabase

Last Updated: January 14, 2026
