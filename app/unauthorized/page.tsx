'use client';

import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useRBAC } from '@/hooks/useRBAC';
import { getRoleDisplayName } from '@/lib/rbac/utils';

export default function UnauthorizedPage() {
  const { user } = useUser();
  const { roles } = useRBAC();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You don&apos;t have permission to access this page.
          {roles.length > 0 && (
            <span className="block mt-2 text-sm">
              Your current role(s):{' '}
              <span className="font-medium text-gray-900">
                {roles.map(getRoleDisplayName).join(', ')}
              </span>
            </span>
          )}
        </p>

        {/* Actions */}
        <div className="space-y-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/"
                className="block w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Go to Homepage
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/"
                className="block w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Go to Homepage
              </Link>
            </>
          )}
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500">
          If you believe this is an error, please contact your administrator.
        </p>
      </div>
    </div>
  );
}
