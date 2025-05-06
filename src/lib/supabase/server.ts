// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// Function to get the current user session on the server
export async function getUserSession() {
    const supabase = createSupabaseServerClient();
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Error getting user session:', error);
            return { session: null, error };
        }
        return { session, error: null };
    } catch (error) {
        console.error('Unexpected error in getUserSession:', error);
        return { session: null, error };
    }
}

// Example function to check if user is admin (replace with your actual logic)
// This might involve checking a custom claim in the JWT or querying a 'roles' table
export async function isAdmin(userId: string): Promise<boolean> {
    // Placeholder: Replace with actual admin check logic
    // Option 1: Check custom claims (if set up during sign-up/JWT hook)
    // const supabase = createSupabaseServerClient();
    // const { data: { user } } = await supabase.auth.getUser();
    // return user?.app_metadata?.role === 'admin';

    // Option 2: Query a 'profiles' or 'roles' table (requires service role or appropriate RLS)
    // const supabaseAdmin = createSupabaseServerClient(); // Or potentially service role client
    // const { data, error } = await supabaseAdmin
    //     .from('profiles') // Or your user roles table
    //     .select('role')
    //     .eq('id', userId)
    //     .single();
    // return !error && data?.role === 'admin';

    console.warn(`isAdmin check for user ${userId} is using a placeholder. Implement actual logic.`);
    // Defaulting to false for safety until implemented
    return false;
}

