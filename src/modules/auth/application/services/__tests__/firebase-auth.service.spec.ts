import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { FirebaseAuthService } from '../firebase-auth.service';
import { AuthModule } from '../../../auth.module';
import { FirebaseAdminModule } from '../../../../firebase/firebase-admin.module';
import {
  createUser,
  generateCustomToken,
  verifyCustomToken,
  updateUserEmail,
  clearAuth,
} from '../../../../../common/utils/admin-auth-test.utils';

describe('FirebaseAuthService', () => {
  let service: FirebaseAuthService;
  let app: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: `src/common/config/env/${process.env.NODE_ENV}.env`,
          isGlobal: true,
        }),
        FirebaseAdminModule,
        AuthModule,
      ],
      providers: [FirebaseAuthService],
    }).compile();

    service = module.get<FirebaseAuthService>(FirebaseAuthService);
    app = module.createNestApplication();

    await app.init();
  });

  beforeEach(async () => {
    await clearAuth();
  });

  afterAll(async () => {
    await clearAuth();
    await app.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully validate token and verify admin user', async () => {
    const mockedUid = 'abc123';
    const mockedEmail = process.env.ADMIN_EMAIL as string;

    const userRecord = await createUser(mockedUid, mockedEmail);

    const customToken = await generateCustomToken(userRecord.uid);

    const { idToken } = await verifyCustomToken(customToken);

    await updateUserEmail(userRecord.uid, mockedEmail);

    await request(app.getHttpServer())
      .post('/api/admin/auth/verify-admin-access')
      .set('Authorization', `Bearer ${idToken}`)
      .then((res) => {
        expect(res.status).toBe(201);
        expect(res.ok).toBeTruthy();
      });
  });

  it('should fail to verify admin user if user is not the expected one', async () => {
    const mockedUid = 'def456';
    const mockedEmail = 'L8QpG@example.com';

    const userRecord = await createUser(mockedUid, mockedEmail);

    const customToken = await generateCustomToken(userRecord.uid);

    const { idToken } = await verifyCustomToken(customToken);

    await updateUserEmail(userRecord.uid, mockedEmail);

    await request(app.getHttpServer())
      .post('/api/admin/auth/verify-admin-access')
      .set('Authorization', `Bearer ${idToken}`)
      .then((res) => {
        expect(res.status).toBe(401);
        expect(res.ok).toBeFalsy();
      });
  });

  it('should fail to verify admin user if user email is not verified', async () => {
    const mockedUid = 'abc123';
    const mockedEmail = process.env.ADMIN_EMAIL as string;
    const mockedIsEmailVerified = false;

    const userRecord = await createUser(
      mockedUid,
      mockedEmail,
      mockedIsEmailVerified,
    );

    const customToken = await generateCustomToken(userRecord.uid);

    const { idToken } = await verifyCustomToken(customToken);

    await request(app.getHttpServer())
      .post('/api/admin/auth/verify-admin-access')
      .set('Authorization', `Bearer ${idToken}`)
      .then((res) => {
        expect(res.status).toBe(401);
        expect(res.ok).toBeFalsy();
      });
  });

  it('should fail to verify admin user if token is not valid', async () => {
    const randomToken = 'cR4zY4nDraNdOmT0k3n';

    await request(app.getHttpServer())
      .post('/api/admin/auth/verify-admin-access')
      .set('Authorization', `Bearer ${randomToken}`)
      .then((res) => {
        expect(res.status).toBe(401);
        expect(res.ok).toBeFalsy();
      });
  });

  it('should successfully revoke token', async () => {
    const mockedUid = 'abc123';
    const mockedEmail = process.env.ADMIN_EMAIL as string;

    const userRecord = await createUser(mockedUid, mockedEmail);

    const customToken = await generateCustomToken(userRecord.uid);

    const { idToken } = await verifyCustomToken(customToken);

    await request(app.getHttpServer())
      .post('/api/admin/auth/revoke-token')
      .set('Authorization', `Bearer ${idToken}`)
      .then((res) => {
        expect(res.status).toBe(201);
        expect(res.ok).toBeTruthy();
      });
  });
});
