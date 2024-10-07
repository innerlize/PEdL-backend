import { Module } from '@nestjs/common';
import { FirestoreRepository } from './infrastructure/repositories/firebase-firestore.repository';
import { FirebaseAdminModule } from '../firebase/firebase-admin.module';

@Module({
  imports: [FirebaseAdminModule],
  providers: [
    {
      provide: 'DatabaseRepository',
      useClass: FirestoreRepository,
    },
  ],
  exports: ['DatabaseRepository'],
})
export class DatabaseModule {}
