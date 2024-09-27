import { Module, Global, InternalServerErrorException } from '@nestjs/common';
import { getFirebaseAppConfig } from '../../common/config/get-firebase-app-config';
import * as admin from 'firebase-admin';

@Global()
@Module({
  providers: [
    {
      provide: 'FirebaseAdmin',
      useFactory: async () => {
        try {
          const config = await getFirebaseAppConfig();

          const firebaseApp = admin.initializeApp(config);

          return firebaseApp;
        } catch (error) {
          throw new InternalServerErrorException(error);
        }
      },
    },
  ],
  exports: ['FirebaseAdmin'],
})
export class FirebaseAdminModule {}
