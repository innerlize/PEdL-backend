import { Module } from '@nestjs/common';
import { FirebaseStorageRepository } from './infrastructure/repositories/firebase-storage.repository';
import { FirebaseAdminModule } from '../firebase/firebase-admin.module';

@Module({
  imports: [FirebaseAdminModule],
  providers: [
    {
      provide: 'StorageRepository',
      useClass: FirebaseStorageRepository,
    },
  ],
  exports: ['StorageRepository'],
})
export class StorageModule {}
