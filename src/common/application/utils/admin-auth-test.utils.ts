import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

export async function createUser(
  uid: string,
  email: string,
  emailVerified: boolean = true,
): Promise<admin.auth.UserRecord> {
  return await admin.auth().createUser({
    uid,
    email,
    emailVerified,
  });
}

export async function generateCustomToken(uid: string): Promise<string> {
  return await admin.auth().createCustomToken(uid);
}

export async function verifyCustomToken(
  customToken: string,
): Promise<{ idToken: string }> {
  const authEmulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;

  const response = await fetch(
    `http://${authEmulatorHost}/www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=fake-api-key`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: customToken,
        returnSecureToken: true,
      }),
    },
  );

  if (!response.ok) {
    throw new Error('Failed to verify custom token');
  }

  return await response.json();
}

export async function updateUserEmail(
  uid: string,
  email: string,
): Promise<admin.auth.UserRecord> {
  return await admin.auth().updateUser(uid, {
    email,
    emailVerified: true,
  });
}

export const clearAuth = async (): Promise<void> => {
  const firebaseProjectId = process.env.GCLOUD_PROJECT;
  const authEmulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;

  const res = await fetch(
    `http://${authEmulatorHost}/emulator/v1/projects/${firebaseProjectId}/accounts`,
    {
      method: 'DELETE',
    },
  );

  if (res.status !== 200 || !res.ok)
    throw new Error('Unable to reset Authentication Emulators');
};

export const loginAsAdmin = async (): Promise<string> => {
  const mockedUid = 'abc123';
  const mockedEmail = process.env.ADMIN_EMAIL as string;

  const userRecord = await createUser(mockedUid, mockedEmail);

  const customToken = await generateCustomToken(userRecord.uid);

  const { idToken } = await verifyCustomToken(customToken);

  await updateUserEmail(userRecord.uid, process.env.ADMIN_EMAIL as string);

  return idToken;
};
