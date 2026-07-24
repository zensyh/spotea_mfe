import { verifySession } from '@repo/auth';

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

  return (
    <div>
      <h1>Account Overview</h1>
      <h2>Your Profile (from Redis session)</h2>
      <table border={1}>
        <tbody>
          <tr><td>ID</td><td>{session.user.id}</td></tr>
          <tr><td>Name</td><td>{session.user.name}</td></tr>
          <tr><td>Username</td><td>{session.user.username}</td></tr>
          <tr><td>Email</td><td>{session.user.email ?? '(not set)'}</td></tr>
          <tr><td>Role</td><td>{session.user.role}</td></tr>
          <tr><td>Token (sid)</td><td>{session.token}</td></tr>
        </tbody>
      </table>
      <a href="/">Back to Home</a>
    </div>
  );
}
