import { Module } from '@nestjs/common';
import { FirebaseRepository } from './infrastructure/repositories/firebase.repository';
import { getFirebaseConfig } from '../../common/config/get-firebase-config';

@Module({
  providers: [
    {
      provide: 'FirebaseAdmin',
      useFactory: getFirebaseConfig,
    },
    {
      provide: 'DatabaseRepository',
      useClass: FirebaseRepository,
    },
  ],
  exports: ['DatabaseRepository'],
})
export class DatabaseModule {}
