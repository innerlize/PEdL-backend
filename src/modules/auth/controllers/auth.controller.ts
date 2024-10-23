import {
  Controller,
  Post,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthToken } from '../../../common/application/decorators/auth-token.decorator';
import { AuthService } from '../../../common/domain/auth-service.interface';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@ApiHeader({
  name: 'Authorization',
  description:
    'In order to access this endpoint, you must provide a valid token signed by Firebase',
  examples: {
    'Bearer {token}': {
      value:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    },
  },
})
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
