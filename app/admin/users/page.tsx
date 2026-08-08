'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useRBAC } from '@/hooks/useRBAC';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import { userManagementService, type ManagedUser } from '@/lib/services/user-management';
import { getAllRoles, getRoleDisplayName } from '@/lib/rbac/utils';
import type { RoleName } from '@/lib/rbac/types';

// ============================================================================
// CONSTANTS
// ============================================================================

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  AGENT: 'bg-blue-100 text-blue-800',
  USER: 'bg-green-100 text-green-800',
};

const UNDO_TIMEOUT = 8000; // 8 seconds to undo

// ============================================================================
// TYPES
// ============================================================================

interface UndoAction {
  type: 'role_change' | 'delete';
  userId: string;
  previousData: Partial<ManagedUser>;
  toastId: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminUsersPage() {
  // ---------------------------------------------------------------------------
  // Hooks & State
  // ---------------------------------------------------------------------------
  const { user: currentUser } = useUser();
  const { hasRole } = useRBAC();
  const toast = useToast();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());

  // Undo action tracking
  const pendingUndoActions = useRef<Map<string, UndoAction>>(new Map());
  const undoTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userManagementService.listUsers();
      setUsers(data.users);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      undoTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Undo Logic
  // ---------------------------------------------------------------------------
  const executeUndoAction = useCallback(
    async (actionId: string) => {
      const action = pendingUndoActions.current.get(actionId);
      if (!action) return;

      // Clear the timeout since user clicked undo
      const timeout = undoTimeouts.current.get(actionId);
      if (timeout) clearTimeout(timeout);
      undoTimeouts.current.delete(actionId);
      pendingUndoActions.current.delete(actionId);

      setProcessingUsers((prev) => new Set(prev).add(action.userId));

      try {
        if (action.type === 'role_change' && action.previousData.role) {
          await userManagementService.updateRole(action.userId, action.previousData.role as RoleName);
          setUsers((prev) =>
            prev.map((u) =>
              u.id === action.userId ? { ...u, role: action.previousData.role! } : u
            )
          );
          toast.success('Role change undone');
        }
        // Note: Delete undo would require server-side soft delete support
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to undo action');
      } finally {
        setProcessingUsers((prev) => {
          const next = new Set(prev);
          next.delete(action.userId);
          return next;
        });
      }
    },
    [toast]
  );

  const registerUndoAction = useCallback(
    (action: Omit<UndoAction, 'toastId'>) => {
      const actionId = `${action.type}-${action.userId}-${Date.now()}`;

      // Show toast with undo button
      const toastId = toast.success(
        action.type === 'role_change'
          ? `Role changed to ${getRoleDisplayName(action.previousData.role as RoleName || 'USER')}`
          : 'User deleted',
        {
          label: 'Undo',
          onClick: () => executeUndoAction(actionId),
        }
      );

      // Store the action
      pendingUndoActions.current.set(actionId, { ...action, toastId });

      // Set timeout to clear the action (no more undo available)
      const timeout = setTimeout(() => {
        pendingUndoActions.current.delete(actionId);
        undoTimeouts.current.delete(actionId);
      }, UNDO_TIMEOUT);

      undoTimeouts.current.set(actionId, timeout);
    },
    [toast, executeUndoAction]
  );

  // ---------------------------------------------------------------------------
  // User Actions
  // ---------------------------------------------------------------------------
  const handleRoleChange = async (userId: string, newRole: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user || processingUsers.has(userId)) return;

    const previousRole = user.role;
    if (previousRole === newRole) return;

    setProcessingUsers((prev) => new Set(prev).add(userId));

    // Optimistic update
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));

    try {
      await userManagementService.updateRole(userId, newRole as RoleName);

      // Register undo action with PREVIOUS role (so undo reverts to it)
      registerUndoAction({
        type: 'role_change',
        userId,
        previousData: { role: previousRole },
      });
    } catch (err) {
      // Revert on error
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: previousRole } : u)));
      toast.error(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setProcessingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error('Cannot delete your own account');
      return;
    }

    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (!confirm(`Delete ${user.email}? This action cannot be undone.`)) {
      return;
    }

    setProcessingUsers((prev) => new Set(prev).add(userId));

    try {
      await userManagementService.deleteUser(userId);

      // Remove from local state
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setSelectedUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });

      toast.success(`${user.email} deleted`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setProcessingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleBulkDelete = async () => {
    const userIds = Array.from(selectedUsers);
    const count = userIds.length;

    if (count === 0) return;

    const confirmMessage = count === 1
      ? 'Delete 1 user? This action cannot be undone.'
      : `Delete ${count} users? This action cannot be undone.`;

    if (!confirm(confirmMessage)) return;

    // Mark all as processing
    setProcessingUsers((prev) => new Set([...prev, ...userIds]));

    const { deleted, errors } = await userManagementService.bulkDelete(userIds, currentUser?.id);

    // Refresh and clear selection
    await fetchUsers();
    setSelectedUsers(new Set());

    // Show results
    if (deleted > 0) {
      toast.success(`Deleted ${deleted} user${deleted > 1 ? 's' : ''}`);
    }
    if (errors.length > 0) {
      toast.error(errors[0]);
    }
  };

  // ---------------------------------------------------------------------------
  // Selection Handlers
  // ---------------------------------------------------------------------------
  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    const selectableUsers = filteredUsers.filter((u) => u.id !== currentUser?.id);
    if (selectedUsers.size === selectableUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(selectableUsers.map((u) => u.id)));
    }
  };

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------
  const filteredUsers = users.filter((user) => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch =
      search === '' ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const availableRoles = getAllRoles();
  const selectableUsers = filteredUsers.filter((u) => u.id !== currentUser?.id);
  const allSelectableSelected = selectableUsers.length > 0 && selectedUsers.size === selectableUsers.length;

  // ---------------------------------------------------------------------------
  // Access Check
  // ---------------------------------------------------------------------------
  if (!hasRole('ADMIN')) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">You don&apos;t have permission to view this page.</p>
        <Link href="/admin" className="mt-4 inline-block text-purple-600 hover:underline">
          Back to Admin Dashboard
        </Link>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div>
      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-gray-600">Manage user accounts and roles</p>
      </header>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Roles</option>
          {availableRoles.map((role) => (
            <option key={role} value={role}>
              {getRoleDisplayName(role)}
            </option>
          ))}
        </select>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.size > 0 && (
        <div className="mb-4 flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <span className="text-sm font-medium text-purple-900">
            {selectedUsers.size} selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <TrashIcon className="w-4 h-4" />
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedUsers(new Set())}
            className="px-3 py-1.5 text-sm text-purple-700 hover:text-purple-900"
          >
            Clear
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      )}

      {/* Users Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelectableSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isCurrentUser={user.id === currentUser?.id}
                    isSelected={selectedUsers.has(user.id)}
                    isProcessing={processingUsers.has(user.id)}
                    availableRoles={availableRoles}
                    onSelect={toggleSelectUser}
                    onRoleChange={handleRoleChange}
                    onDelete={handleDeleteUser}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats */}
      {!loading && <UserStats users={users} />}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface UserRowProps {
  user: ManagedUser;
  isCurrentUser: boolean;
  isSelected: boolean;
  isProcessing: boolean;
  availableRoles: RoleName[];
  onSelect: (userId: string) => void;
  onRoleChange: (userId: string, role: string) => void;
  onDelete: (userId: string) => void;
}

function UserRow({
  user,
  isCurrentUser,
  isSelected,
  isProcessing,
  availableRoles,
  onSelect,
  onRoleChange,
  onDelete,
}: UserRowProps) {
  const rowClasses = [
    isSelected && 'bg-purple-50',
    isCurrentUser && 'bg-gray-50',
    isProcessing && 'opacity-50',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <tr className={rowClasses}>
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(user.id)}
          disabled={isCurrentUser || isProcessing}
          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <UserAvatar name={user.full_name || user.email} />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.full_name || 'No name'}
              {isCurrentUser && (
                <span className="ml-2 text-xs text-purple-600 font-normal">(You)</span>
              )}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <select
          value={user.role}
          onChange={(e) => onRoleChange(user.id, e.target.value)}
          disabled={isCurrentUser || isProcessing}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 transition-all ${
            ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-800'
          } ${
            isCurrentUser || isProcessing
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-purple-300'
          }`}
        >
          {availableRoles.map((role) => (
            <option key={role} value={role}>
              {getRoleDisplayName(role)}
            </option>
          ))}
        </select>
        {isProcessing && <span className="ml-2 text-xs text-gray-500">Saving...</span>}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <StatusBadge verified={!!user.email_confirmed_at} />
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(user.created_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right">
        {!isCurrentUser && (
          <button
            onClick={() => onDelete(user.id)}
            disabled={isProcessing}
            className="text-red-600 hover:text-red-900 disabled:opacity-50 p-1 rounded hover:bg-red-50 transition-colors"
            title="Delete user"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
      </td>
    </tr>
  );
}

function UserAvatar({ name }: { name: string }) {
  return (
    <div className="h-10 w-10 shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
      <span className="text-gray-600 font-medium text-sm">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function StatusBadge({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      Pending
    </span>
  );
}

function UserStats({ users }: { users: ManagedUser[] }) {
  const stats = [
    { label: 'Total Users', value: users.length, color: 'text-gray-900' },
    { label: 'Users', value: users.filter((u) => u.role === 'USER').length, color: 'text-green-600' },
    { label: 'Agents', value: users.filter((u) => u.role === 'AGENT').length, color: 'text-blue-600' },
    { label: 'Admins', value: users.filter((u) => u.role === 'ADMIN').length, color: 'text-purple-600' },
  ];

  return (
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg shadow p-4">
          <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          <div className="text-sm text-gray-500">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}
