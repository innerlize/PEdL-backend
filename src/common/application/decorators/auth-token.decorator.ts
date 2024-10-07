import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

export const AuthToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request: Request = ctx.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      throw new UnauthorizedException('No authorization header provided');
    }

    const [typeOfAuth, token] = authorizationHeader?.split(' ');

    if (typeOfAuth !== 'Bearer') {
      throw new UnauthorizedException(
        'Authorization header must be of type Bearer',
      );
    }

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    return token;
  },
);
