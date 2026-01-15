import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin Client
 *
 * This client uses the SERVICE_ROLE_KEY which has admin privileges.
 * IMPORTANT: Only use this on the server side (API routes, server actions).
 * NEVER expose this client or the service role key to the browser.
 *
 * Required environment variable:
 * - SUPABASE_SERVICE_ROLE_KEY (get from Supabase Dashboard → Settings → API)
 */

let adminClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. ' +
      'Get it from Supabase Dashboard → Settings → API → service_role key'
    );
  }

  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}

/**
 * List all users in the system
 */
export async function listAllUsers(page = 1, perPage = 50) {
  const admin = getSupabaseAdminClient();
  return admin.auth.admin.listUsers({
    page,
    perPage,
  });
}

/**
 * Get a single user by ID
 */
export async function getUserById(userId: string) {
  const admin = getSupabaseAdminClient();
  return admin.auth.admin.getUserById(userId);
}

/**
 * Update a user's role
 */
export async function updateUserRole(userId: string, role: string) {
  const admin = getSupabaseAdminClient();
  return admin.auth.admin.updateUserById(userId, {
    user_metadata: { role },
  });
}

/**
 * Update user metadata
 */
export async function updateUserMetadata(
  userId: string,
  metadata: Record<string, unknown>
) {
  const admin = getSupabaseAdminClient();
  return admin.auth.admin.updateUserById(userId, {
    user_metadata: metadata,
  });
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string) {
  const admin = getSupabaseAdminClient();
  return admin.auth.admin.deleteUser(userId);
}
