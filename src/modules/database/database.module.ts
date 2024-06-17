import { Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseRepository } from './infrastructure/repositories/firebase.repository';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: 'FirebaseAdmin',
      useFactory: (configService: ConfigService) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
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
    {
      provide: 'DatabaseRepository',
      useClass: FirebaseRepository,
    },
  ],
  exports: ['DatabaseRepository'],
})
export class DatabaseModule {}
