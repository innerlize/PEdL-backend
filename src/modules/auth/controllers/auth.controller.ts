import {
  Controller,
  Post,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthToken } from '../../../common/application/decorators/auth-token.decorator';
import { AuthService } from '../../../common/domain/auth-service.interface';

@Controller('api/admin/auth')
export class AuthController {
  constructor(
    @Inject('AuthService') private readonly authService: AuthService,
  ) {}

  @Post('verify-admin-access')
  async verifyAdminAccess(@AuthToken() token: string): Promise<boolean> {
    const isExpectedUser = await this.authService.verifyAdminAccess(token);

    if (!isExpectedUser) {
      throw new UnauthorizedException();
    }

    return isExpectedUser;
  }

  @Post('revoke-token')
  async revokeToken(@AuthToken() token: string): Promise<void> {
    await this.authService.revokeToken(token);
  }
}
