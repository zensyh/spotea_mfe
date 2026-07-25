import { verifySession, COOKIE_NAME, authenticatedFetch } from '@repo/auth';
import { cookies } from 'next/headers';

export default async function ProfilePage() {
  const session = await verifySession();
  if (!session) {
    return (
      <div>
        <p>Not authenticated</p>
        <a href="/login">Go to Login</a>
      </div>
    );
  }

  const cookieStore = await cookies();
  const sid = cookieStore.get(COOKIE_NAME)?.value;

  let profileEmail: string | null = null;
  let profilePhone: string | null = null;
  let fetchError: string | null = null;

  if (sid) {
    try {
      const res = await authenticatedFetch(sid, '/profile');
      const body = await res.json();
      if (body.success && body.data) {
        profileEmail = body.data.email ?? null;
        profilePhone = body.data.phone ?? null;
      } else {
        fetchError = body.message || 'Failed to fetch profile';
      }
    } catch (e) {
      fetchError = e instanceof Error ? e.message : 'Fetch error';
    }
  }

  return (
    <div>
      <h1>Profile</h1>
      <p><b>Name:</b> {session.user.name}</p>
      <p><b>Username:</b> {session.user.username}</p>
      <p><b>Role:</b> {session.user.role}</p>
      <p><b>Email:</b> {profileEmail ?? '(not available)'}</p>
      <p><b>Phone:</b> {profilePhone ?? '(not set)'}</p>
      {fetchError && <p><b>Profile fetch:</b> {fetchError}</p>}
      <hr />
      <a href="/account/profile/edit">Edit Name</a>
      <br />
      <a href="/account/profile/password">Change Password</a>
      <br />
      <a href="/account/profile/delete">Delete Account</a>
      <br />
      <hr />
      <a href="/account">Back to Dashboard</a>
    </div>
  );
}
