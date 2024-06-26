import * as admin from 'firebase-admin';
import { Environment } from '../application/enums/environment.enum';

export const getFirebaseConfig = () => {
  let app: admin.app.App;

  if (
    process.env.NODE_ENV === Environment.DEVELOPMENT ||
    process.env.NODE_ENV === Environment.TEST
  ) {
    app = admin.initializeApp({
      projectId: process.env.FIRESTORE_PROJECT_ID,
      credential: admin.credential.applicationDefault(),
      databaseURL: `http://${process.env.FIRESTORE_EMULATOR_HOST}`,
    });
  } else {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIRESTORE_PROJECT_ID,
        clientEmail: process.env.FIRESTORE_CLIENT_EMAIL,
        privateKey: process.env.FIRESTORE_PRIVATE_KEY,
      }),
      databaseURL: `https://${process.env.FIRESTORE_PROJECT_ID}.firebaseio.com`,
    });
  }

  return app;
};
