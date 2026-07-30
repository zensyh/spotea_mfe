import { verifySession } from '@repo/auth';

export default async function DeleteAccountPage() {
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
      <h1>Delete Account</h1>
      <p>This action is permanent and cannot be undone.</p>
      <p>Your account will be deactivated and all your data will be removed.</p>
      <br />
      <form action="/account/api/profile/delete" method="POST">
        <input type="hidden" name="confirm" value="true" />
        <button type="submit">
          Delete My Account
        </button>
      </form>
      <br />
      <a href="/account/profile">Cancel</a>
    </div>
  );
}
