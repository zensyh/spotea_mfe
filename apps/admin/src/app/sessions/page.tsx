import { verifySession, COOKIE_NAME, protectedFetch, getUserSessions } from '@repo/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FormGuard } from '@/shared/lib/form-guard';

export default async function AdminSessionsPage() {
  const session = await verifySession();
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
    return null;
  }

  const cookieStore = await cookies();
  const sid = cookieStore.get(COOKIE_NAME)?.value;

  if (!sid) {
    redirect('/login');
    return null;
  }

  let users: Array<{ id: string; username: string; role: string; isActive: boolean }> = [];
  let error: string | null = null;

  try {
    const res = await protectedFetch(sid, '/admin/users');
    const body = await res.json();
    if (body.success && body.data) {
      users = body.data.users || body.data;
    } else {
      error = body.message || 'Failed to fetch users';
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error';
  }

  const usersWithSessions = await Promise.all(
    users.map(async (user) => {
      const sids = await getUserSessions(user.id);
      return { ...user, sessionCount: sids.length };
    }),
  );

  return (
    <div>
      <h1>User Session Management</h1>
      {error && <p><b>Error:</b> {error}</p>}
      <table border={1}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
            <th>Active</th>
            <th>Active Sessions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {usersWithSessions.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.role}</td>
              <td>{u.isActive ? 'Yes' : 'No'}</td>
              <td>{u.sessionCount}</td>
              <td>
                {u.sessionCount > 0 && (
                  <FormGuard action="/admin/api/admin/users/revoke-sessions">
                    <input type="hidden" name="userId" value={u.id} />
                    <button type="submit">Revoke All Sessions</button>
                  </FormGuard>
                )}
                {u.isActive && (
                  <FormGuard action={`/admin/api/admin/users/${u.id}`}>
                    <input type="hidden" name="_method" value="PATCH" />
                    <input type="hidden" name="isActive" value="false" />
                    <button type="submit">Deactivate</button>
                  </FormGuard>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <br />
      <a href="/admin">Back to Dashboard</a>
    </div>
  );
}
