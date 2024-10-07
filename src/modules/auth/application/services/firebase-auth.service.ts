import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { AuthService } from '../../../../common/domain/auth-service.interface';

@Injectable()
export class FirebaseAuthService implements AuthService {
  private auth: admin.auth.Auth;

  constructor(
    @Inject('FirebaseAdmin') private readonly firebaseAdmin: admin.app.App,
  ) {
    this.auth = this.firebaseAdmin.auth();
  }

  private async verifyAndDecodeFirebaseToken(token: string): Promise<any> {
    try {
      const decodedToken = await this.auth.verifyIdToken(token, true);

      return decodedToken;
    } catch (error) {
      return null;
    }
  }

  async verifyAdminAccess(token: string): Promise<boolean> {
    try {
      const userData = await this.verifyAndDecodeFirebaseToken(token);

      if (!process.env.ADMIN_EMAIL) {
        throw new Error("'ADMIN_EMAIL' environment variable not set");
      }

      const isExpectedUser = userData.email === process.env.ADMIN_EMAIL;
      const userEmailIsVerified = userData.email_verified;

      if (isExpectedUser && userEmailIsVerified) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error verifying admin access: ', error);
      return false;
    }
  }

  async revokeToken(token: string): Promise<void> {
    const { uid } = await this.verifyAndDecodeFirebaseToken(token);

    await this.auth.revokeRefreshTokens(uid);
  }
}
