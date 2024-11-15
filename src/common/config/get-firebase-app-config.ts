import * as admin from 'firebase-admin';
import * as http from 'http';
import { Environment } from '../application/enums/environment.enum';

const checkEmulatorHub = async (): Promise<boolean> => {
  const emulatorHubHost = process.env.FIREBASE_EMULATOR_HUB_HOST;

  return new Promise((resolve) => {
    http
      .get(`${emulatorHubHost}/emulators`, (res) => {
        resolve(res.statusCode === 200);
      })
      .on('error', () => resolve(false));
  });
};

export const getFirebaseAppConfig = async (): Promise<admin.AppOptions> => {
  const isDevelopment = process.env.NODE_ENV === Environment.DEVELOPMENT;
  const isTesting = process.env.NODE_ENV === Environment.TEST;

  if (isDevelopment || isTesting) {
    const emulatorHubRunning = await checkEmulatorHub();

    if (!emulatorHubRunning) {
      throw new Error(
        'You are in development or testing mode, and your Firebase Emulator Hub is not running.',
      );
    }
  }

  const config: admin.AppOptions = {
    credential: admin.credential.applicationDefault(),
    storageBucket:
      (isDevelopment || isTesting) && `gs://demo-project.appspot.com`,
  };

  return config;
};
