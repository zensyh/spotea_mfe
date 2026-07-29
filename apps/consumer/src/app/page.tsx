import { verifySession, COOKIE_NAME, protectedFetch } from '@repo/auth';
import { cookies } from 'next/headers';

export default async function Home() {
  const session = await verifySession();

  if (!session) {
    return (
      <div>
        <p>Not authenticated</p>
        <a href="/login">Go to Login</a>
      </div>
    );
  }

  let profileResult: string | null = null;

  try {
    const cookieStore = await cookies();
    const sid = cookieStore.get(COOKIE_NAME)?.value;
    if (sid) {
      const res = await protectedFetch(sid, '/profile');
      const body = await res.json();
      profileResult = JSON.stringify(body, null, 2);
    }
  } catch (e) {
    profileResult = `Fetch error: ${e instanceof Error ? e.message : 'Unknown'}`;
  }

  return (
    <div>
      <h1>Authenticated</h1>
      <h2>Session (from Redis via verifySession)</h2>
      <table border={1}>
        <tbody>
          <tr>
            <td>ID</td>
            <td>{session.user.id}</td>
          </tr>
          <tr>
            <td>Name</td>
            <td>{session.user.name}</td>
          </tr>
          <tr>
            <td>Username</td>
            <td>{session.user.username}</td>
          </tr>
          <tr>
            <td>Role</td>
            <td>{session.user.role}</td>
          </tr>
        </tbody>
      </table>
      <h2>Profile (from backend API via authenticatedFetch)</h2>
      <pre>{profileResult ?? 'No profile data'}</pre>
      <a href="/">Back to Home</a>
    </div>
  );
}
