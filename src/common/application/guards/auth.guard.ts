import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/common/domain/auth-service.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AuthService') private readonly authService: AuthService,
  ) {}

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    const isExpectedUser = await this.authService.verifyAdminAccess(token);

    if (!isExpectedUser) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
