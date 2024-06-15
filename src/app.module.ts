import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FirebaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}