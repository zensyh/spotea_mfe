import { verifySession, getSessionData, COOKIE_NAME } from '@repo/auth';
import { cookies } from 'next/headers';

export default async function EditProfilePage() {
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

  let currentName = session.user.name;
  let currentUsername = session.user.username;

  if (sid) {
    const sessionData = await getSessionData(sid);
    if (sessionData) {
      currentName = sessionData.name;
      currentUsername = sessionData.username;
    }
  }

  return (
    <div>
      <h1>Edit Profile</h1>
      <form action="/api/profile" method="POST">
        <div>
          <label>Name</label>
          <br />
          <input
            type="text"
            name="name"
            defaultValue={currentName}
            required
            minLength={2}
            maxLength={50}
          />
        </div>
        <br />
        <div>
          <label>Username</label>
          <br />
          <input
            type="text"
            name="username"
            defaultValue={currentUsername}
            required
            minLength={3}
            maxLength={30}
          />
        </div>
        <br />
        <button type="submit">Save</button>
      </form>
      <br />
      <a href="/account/profile">Back</a>
    </div>
  );
}
