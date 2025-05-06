// src/app/(admin)/users/page.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, getUserSession, isAdmin } from '@/lib/supabase/server';

// Placeholder type for User/Profile - adjust based on your actual table ('users' or 'profiles')
type UserProfile = {
  id: string;
  email: string | null;
  // Add other fields like 'role', 'created_at' if they exist in your table
  // role?: string;
  // created_at?: string;
};

async function getUsers(): Promise<UserProfile[]> {
    const supabase = createSupabaseServerClient();
    // Adjust the table name ('users' or 'profiles') and selected columns as needed
    const { data, error } = await supabase
        .from('users') // *** ADJUST TABLE NAME if you use 'profiles' or similar ***
        .select('id, email'); // Adjust columns like 'id, email, role, created_at'

    if (error) {
        console.error('Error fetching users/profiles for admin:', error);
        return [];
    }
    return data || [];
}

export default async function AdminUsersPage() {
  const { session, error: sessionError } = await getUserSession();

  if (sessionError || !session?.user) {
    console.log('Admin Users: User not logged in, redirecting to /login');
    redirect('/login');
  }

  const userIsAdmin = await isAdmin(session.user.id);
  if (!userIsAdmin) {
    console.log(`Admin Users: User ${session.user.email} is not an admin, redirecting to /`);
    redirect('/');
  }

  console.log(`Admin Users: Access granted for admin user ${session.user.email}`);
  const users = await getUsers();

  return (
    <div>
      <h1>Manage Users</h1>
      <p>View registered users.</p>
      {/* TODO: Add functionality to invite users or manage roles if needed */}

      <h2>User List</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Email</th>
              {/* Add Role column if applicable */}
              {/* <th>Role</th> */}
              <th>Actions (TODO)</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email || 'N/A'}</td>
                {/* <td>{user.role || 'N/A'}</td> */}
                <td>
                  {/* TODO: Add View Details / Manage Role buttons/links */} 
                  View Details | Manage Role
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

