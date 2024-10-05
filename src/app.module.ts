import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { ProjectsModule } from './modules/projects/projects.module';
import { PartnersModule } from './modules/partners/partners.module';
import { AuthModule } from './modules/auth/auth.module';
import { FirebaseAdminModule } from './modules/firebase/firebase-admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `src/common/config/env/${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    FirebaseAdminModule,
    DatabaseModule,
    ProjectsModule,
    PartnersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
