import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { listAllUsers, updateUserRole, deleteUser } from '@/lib/supabase/admin-client';
import { ROLES } from '@/lib/rbac/config';
import type { RoleName } from '@/lib/rbac/types';

// Verify the requesting user is an admin
async function verifyAdmin(): Promise<{ isAdmin: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { isAdmin: false, error: 'Unauthorized' };
    }

    // Get user's role and normalize to uppercase
    const roleData = user.user_metadata?.role;
    const userRole = roleData ? String(roleData).toUpperCase() : null;

    // Check if user has ADMIN role
    if (!userRole || userRole !== 'ADMIN') {
      return { isAdmin: false, error: 'Forbidden: Admin access required' };
    }

    return { isAdmin: true };
  } catch {
    return { isAdmin: false, error: 'Authentication failed' };
  }
}

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
  const { isAdmin, error } = await verifyAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error }, { status: error === 'Unauthorized' ? 401 : 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '50');

    const { data, error: listError } = await listAllUsers(page, perPage);

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    // Transform users to include role info
    const users = data.users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'pending',
      full_name: user.user_metadata?.full_name || null,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
    }));

    return NextResponse.json({
      users,
      total: data.total,
      page,
      perPage,
    });
  } catch (err) {
    console.error('Error listing users:', err);
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
  }
}

// PATCH /api/admin/users - Update user role
export async function PATCH(request: NextRequest) {
  const { isAdmin, error } = await verifyAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error }, { status: error === 'Unauthorized' ? 401 : 403 });
  }

  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role are required' }, { status: 400 });
    }

    // Validate role
    const validRoles = Object.values(ROLES);
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const { data, error: updateError } = await updateUserRole(userId, role);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role,
      },
    });
  } catch (err) {
    console.error('Error updating user role:', err);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}

// DELETE /api/admin/users - Delete a user
export async function DELETE(request: NextRequest) {
  const { isAdmin, error } = await verifyAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error }, { status: error === 'Unauthorized' ? 401 : 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Prevent self-deletion
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.id === userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const { error: deleteError } = await deleteUser(userId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting user:', err);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
