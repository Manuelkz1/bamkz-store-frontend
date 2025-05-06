// src/app/(admin)/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, getUserSession, isAdmin } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  const { session, error: sessionError } = await getUserSession();

  if (sessionError || !session?.user) {
    // Not logged in, redirect to login page (assuming you have one at /login)
    console.log('Admin Dashboard: User not logged in, redirecting to /login');
    redirect('/login'); // Adjust the login path if necessary
  }

  // Check if the user is an admin
  const userIsAdmin = await isAdmin(session.user.id);
  if (!userIsAdmin) {
    // Not an admin, redirect to home page or show an error
    console.log(`Admin Dashboard: User ${session.user.email} is not an admin, redirecting to /`);
    redirect('/'); // Or show a specific 'Forbidden' page
  }

  // User is logged in and is an admin, render the dashboard
  console.log(`Admin Dashboard: Access granted for admin user ${session.user.email}`);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Administrator!</p>
      <p>User ID: {session.user.id}</p>
      <p>User Email: {session.user.email}</p>
      {/* Add links to other admin sections (Products, Categories, Orders, etc.) here */}
      <ul>
        <li>Manage Products (TODO)</li>
        <li>Manage Categories (TODO)</li>
        <li>View Orders (TODO)</li>
        <li>Manage Users (TODO)</li>
        <li>Site Settings (TODO)</li>
      </ul>
    </div>
  );
}

