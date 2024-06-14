import { Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from './services/firebase.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: 'FirebaseAdmin',
      useFactory: (configService: ConfigService) => {
        const serviceAccount = require(
          configService.get<string>('PATH_TO_SERVICE_ACCOUNT_KEY'),
        );

        const app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });

        return app;
      },

      inject: [ConfigService],
    },
    FirebaseService,
  ],
  exports: [FirebaseService],
})
export class FirebaseModule {}
