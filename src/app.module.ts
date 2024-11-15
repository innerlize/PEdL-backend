import { Module } from '@nestjs/common';
import { DatabaseModule } from './modules/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { ProjectsModule } from './modules/projects/projects.module';
import { PartnersModule } from './modules/partners/partners.module';
import { AuthModule } from './modules/auth/auth.module';
import { FirebaseAdminModule } from './modules/firebase/firebase-admin.module';
import { StorageModule } from './modules/storage/storage.module';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `src/common/config/env/${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    FirebaseAdminModule,
    DatabaseModule,
    StorageModule,
    ProjectsModule,
    PartnersModule,
    AuthModule,
    NestjsFormDataModule,
  ],
})
export class AppModule {}
