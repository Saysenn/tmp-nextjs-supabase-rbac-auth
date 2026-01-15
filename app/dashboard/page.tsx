'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useRBAC } from '@/hooks/useRBAC';
import { RoleGuard } from '@/components/rbac/RoleGuard';

// Role badge colors
const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-800',
  admin: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  user: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  guest: 'bg-gray-100 text-gray-800',
};

export default function DashboardPage() {
  const { user, loading } = useUser();
  const { role, hasPermission } = useRBAC();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Account Status',
      value: 'Active',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'bg-green-500',
    },
    {
      name: 'Member Since',
      value: new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      color: 'bg-blue-500',
    },
    {
      name: 'Last Login',
      value: user.last_sign_in_at
        ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'N/A',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'bg-purple-500',
    },
  ];

  const quickActions = [
    {
      name: 'Update Profile',
      description: 'Change your name and personal information',
      href: '/dashboard/settings?tab=profile',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      color: 'text-blue-600 bg-blue-50',
    },
    {
      name: 'Security Settings',
      description: 'Manage 2FA and password',
      href: '/dashboard/settings?tab=security',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
      color: 'text-green-600 bg-green-50',
    },
    {
      name: 'Account Details',
      description: 'View your account information',
      href: '/dashboard/settings?tab=account',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.user_metadata?.full_name || 'there'}!
          </h1>
          {role && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[role] || ROLE_COLORS.guest}`}>
              {role.replace('_', ' ')}
            </span>
          )}
        </div>
        <p className="mt-2 text-gray-600">Here's what's happening with your account today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3 text-white`}>{stat.icon}</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <div className={`inline-flex rounded-lg p-3 ${action.color}`}>{action.icon}</div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">{action.name}</h3>
              <p className="mt-2 text-sm text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Account Info Card */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Account</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Role</dt>
            <dd className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[role || 'guest']}`}>
                {role?.replace('_', ' ') || 'Unknown'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">User ID</dt>
            <dd className="mt-1 text-xs text-gray-900 font-mono truncate">{user.id}</dd>
          </div>
        </dl>
      </div>

      {/* Admin Section - Only visible to admins */}
      <RoleGuard roles={['admin', 'super_admin']}>
        <div className="mt-8 bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>
          <p className="text-sm text-gray-600 mb-4">
            As an admin, you have access to user management features.
          </p>
          <Link
            href="/dashboard/admin/users"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            Manage Users
          </Link>
        </div>
      </RoleGuard>
    </div>
  );
}
