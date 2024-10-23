import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../../../database/database.module';
import { PartnersService } from '../partners.service';
import { PartnersController } from '../../../controllers/partners.controller';
import { CreatePartnerDto } from '../../dtos/create-partner.dto';
import { UpdatePartnerDto } from '../../dtos/update-partner.dto';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { AuthModule } from '../../../../auth/auth.module';
import {
  clearAuth,
  loginAsAdmin,
} from '../../../../../common/utils/admin-auth-test.utils';

describe('ProjectsService', () => {
  let service: PartnersService;
  let app: any;
  let testEnv: RulesTestEnvironment;
  let testIdToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: `src/common/config/env/${process.env.NODE_ENV}.env`,
          isGlobal: true,
        }),
        DatabaseModule,
        AuthModule,
      ],
      providers: [PartnersService],
      controllers: [PartnersController],
    }).compile();

    testEnv = await initializeTestEnvironment({
      projectId: process.env.GCLOUD_PROJECT,
    });
    service = module.get<PartnersService>(PartnersService);
    app = module.createNestApplication();

    await app.init();
  });

  beforeEach(async () => {
    await clearAuth();
    testIdToken = '';
    await testEnv.clearFirestore();

    const idToken = await loginAsAdmin();
    testIdToken = idToken;
  });

  afterAll(async () => {
    await clearAuth();
    testIdToken = '';
    await testEnv.cleanup();
    await app.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of partners', async () => {
    const partners: CreatePartnerDto[] = [
      {
        name: 'Partner 1',
        image: 'example.com',
      },
      {
        name: 'Partner 2',
        image: 'example.com',
      },
    ];

    for (const partner of partners) {
      await request(app.getHttpServer())
        .post('/api/partners')
        .set('Authorization', `Bearer ${testIdToken}`)
        .send(partner);
    }

    await request(app.getHttpServer())
      .get('/api/partners')
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
              image: expect.any(String),
              created_at: expect.anything(),
              updated_at: expect.anything(),
            }),
          ]),
        );
      });
  });

  it('should return a partner by id', async () => {
    const partner: CreatePartnerDto = {
      name: 'Partner 1',
      image: 'example.com',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/api/partners')
      .set('Authorization', `Bearer ${testIdToken}`)
      .send(partner);

    await request(app.getHttpServer())
      .get(`/api/partners/${createResponse.body.data.id}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            image: expect.any(String),
            created_at: expect.anything(),
            updated_at: expect.anything(),
          }),
        );
      });

    await request(app.getHttpServer())
      .get(`/api/partners`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
      });
  });

  it('should create a partner', async () => {
    const partner: CreatePartnerDto = {
      name: 'Partner 1',
      image: 'example.com',
    };

    await request(app.getHttpServer())
      .post('/api/partners')
      .set('Authorization', `Bearer ${testIdToken}`)
      .send(partner)
      .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body).toEqual(
          expect.objectContaining({
            message: expect.any(String),
            status: expect.any(Number),
            data: expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
              image: expect.any(String),
              created_at: expect.anything(),
              updated_at: expect.anything(),
            }),
          }),
        );
      });
  });

  it('should update a partner', async () => {
    const partner: CreatePartnerDto = {
      name: 'Partner 1',
      image: 'example.com',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/api/partners')
      .set('Authorization', `Bearer ${testIdToken}`)
      .send(partner);

    const updatedPartnerDto: UpdatePartnerDto = {
      name: 'Partner 1 - Updated',
    };

    await request(app.getHttpServer())
      .patch(`/api/partners/${createResponse.body.data.id}`)
      .set('Authorization', `Bearer ${testIdToken}`)
      .send(updatedPartnerDto)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.objectContaining({
            message: expect.any(String),
            status: expect.any(Number),
            data: expect.objectContaining({
              name: updatedPartnerDto.name,
            }),
          }),
        );
        expect(res.body.data.name).not.toBe(partner.name);
      });
  });

  it('should delete a partner', async () => {
    const partner: CreatePartnerDto = {
      name: 'Project 1',
      image: 'example.com',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/api/partners')
      .set('Authorization', `Bearer ${testIdToken}`)
      .send(partner);

    await request(app.getHttpServer())
      .delete(`/api/partners/${createResponse.body.data.id}`)
      .set('Authorization', `Bearer ${testIdToken}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.objectContaining({
            message: expect.any(String),
            status: expect.any(Number),
          }),
        );
      });
  });
});
