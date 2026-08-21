import { verifySession } from '@repo/auth';

export default async function ChangePasswordPage() {
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
      <h1>Change Password</h1>
      <form action="/account/api/profile/password" method="POST">
        <div>
          <label>Current Password</label>
          <br />
          <input
            type="password"
            name="currentPassword"
            required
            minLength={8}
          />
        </div>
        <br />
        <div>
          <label>New Password</label>
          <br />
          <input
            type="password"
            name="newPassword"
            required
            minLength={8}
          />
        </div>
        <br />
        <div>
          <label>Confirm New Password</label>
          <br />
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={8}
          />
        </div>
        <br />
        <button type="submit">Change Password</button>
      </form>
      <br />
      <p>Changing your password will log you out of all devices.</p>
      <br />
      <a href="/account/profile">Back</a>
    </div>
  );
}
