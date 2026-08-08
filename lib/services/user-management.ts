/**
 * User Management Service
 * Handles all API calls related to user management
 */

import type { RoleName } from '@/lib/rbac/types';

export interface ManagedUser {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

export interface ListUsersResponse {
  users: ManagedUser[];
  total: number;
  page: number;
  perPage: number;
}

export interface UpdateRoleResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface ApiError {
  error: string;
}

class UserManagementService {
  private readonly baseUrl = '/api/admin/users';

  /**
   * Fetch all users with pagination
   */
  async listUsers(page = 1, perPage = 50): Promise<ListUsersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: perPage.toString(),
    });

    const response = await fetch(`${this.baseUrl}?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch users');
    }

    return data;
  }

  /**
   * Update a user's role
   */
  async updateRole(userId: string, role: RoleName): Promise<UpdateRoleResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update role');
    }

    return data;
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}?userId=${userId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete user');
    }

    return data;
  }

  /**
   * Bulk delete users
   * Returns array of results for each deletion attempt
   */
  async bulkDelete(
    userIds: string[],
    currentUserId?: string
  ): Promise<{ deleted: number; errors: string[] }> {
    let deleted = 0;
    const errors: string[] = [];

    for (const userId of userIds) {
      // Skip current user
      if (userId === currentUserId) {
        errors.push('Cannot delete your own account');
        continue;
      }

      try {
        await this.deleteUser(userId);
        deleted++;
      } catch (err) {
        errors.push(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    return { deleted, errors };
  }
}

// Export singleton instance
export const userManagementService = new UserManagementService();
