import { Module } from '@nestjs/common';
import { FirebaseAuthService } from './application/services/firebase-auth.service';
import { AuthController } from './controllers/auth.controller';

@Module({
  providers: [
    {
      provide: 'AuthService',
      useClass: FirebaseAuthService,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
