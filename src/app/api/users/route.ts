import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// IMPORTANT: Accessing the auth.users table directly via the client library is typically
// restricted for security reasons. You usually manage users via Supabase Auth functions
// or potentially through a service role key on the backend if absolutely necessary and secure.
// This example assumes you might have a separate 'users' or 'profiles' table in the public schema
// linked to auth.users via user ID.

// If you have a 'profiles' table linked to auth.users.id:
const supabase = createClient();

// GET all users/profiles (for admin purposes - ensure proper authorization)
export async function GET(request: NextRequest) {
  // TODO: Implement proper admin authorization check here before proceeding.
  // Example: Verify if the requesting user has an 'admin' role.
  // const { user } = await supabase.auth.getUser(); // Requires auth context
  // if (!user || !isAdmin(user.id)) { // isAdmin is a hypothetical function
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    // Assuming a 'profiles' table linked to auth.users
    // Adjust 'profiles' and the selected columns ('id', 'email', 'role') as needed.
    // If you only use Supabase Auth and don't have a separate profiles table,
    // you'd typically use the Supabase Admin SDK (server-side) to list users.
    const { data, error } = await supabase
      .from('users') // *** ADJUST TABLE NAME if you use 'profiles' or similar ***
      .select('id, email'); // Adjust columns as needed, e.g., 'id, email, role'

    if (error) {
      console.error('Error fetching users/profiles:', error);
      return NextResponse.json({ error: 'Error fetching users/profiles', details: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    console.error('Unexpected error fetching users/profiles:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Unexpected error fetching users/profiles', details: errorMessage }, { status: 500 });
  }
}

// Other methods (POST, PUT, DELETE) for user management are complex and depend heavily
// on your auth strategy (e.g., inviting users, updating roles).
// These should be implemented carefully with security considerations.
// Placeholder for POST (e.g., invite user)
export async function POST(request: NextRequest) {
    return NextResponse.json({ message: 'User creation/invitation not implemented yet.' }, { status: 501 });
}

