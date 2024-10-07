import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../../../common/domain/auth-service.interface';
import { AuthController } from '../auth.controller';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: 'AuthService',
          useValue: {
            verifyAdminAccess: jest.fn(),
            revokeToken: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>('AuthService');
  });

  describe('verifyAdminAccess', () => {
    it('should return true if the user is an admin', async () => {
      (authService.verifyAdminAccess as jest.Mock).mockResolvedValue(true);

      const result = await authController.verifyAdminAccess('valid_token');

      expect(result).toBe(true);
      expect(authService.verifyAdminAccess).toHaveBeenCalledWith('valid_token');
    });

    it('should throw UnauthorizedException if the user is not an admin', async () => {
      (authService.verifyAdminAccess as jest.Mock).mockResolvedValue(false);

      await expect(
        authController.verifyAdminAccess('invalid_token'),
      ).rejects.toThrow(UnauthorizedException);

      expect(authService.verifyAdminAccess).toHaveBeenCalledWith(
        'invalid_token',
      );
    });
  });

  describe('revokeToken', () => {
    it('should call revokeToken on the authService', async () => {
      await authController.revokeToken('valid_token');

      expect(authService.revokeToken).toHaveBeenCalledWith('valid_token');
    });
  });
});
