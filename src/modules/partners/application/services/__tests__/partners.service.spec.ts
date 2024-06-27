import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../../../database/database.module';
import { clearDataInEmulator } from '../../../../../utils/clear-data-in-emulator.util';
import { PartnersService } from '../partners.service';
import { PartnersController } from '../../../controllers/partners.controller';
import { CreatePartnerDto } from '../../dtos/create-partner.dto';
import { UpdatePartnerDto } from '../../dtos/update-partner.dto';

describe('ProjectsService', () => {
  let service: PartnersService;
  let app: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: `src/common/config/env/${process.env.NODE_ENV}.env`,
          isGlobal: true,
        }),
        DatabaseModule,
      ],
      providers: [PartnersService],
      controllers: [PartnersController],
    }).compile();

    service = module.get<PartnersService>(PartnersService);
    app = module.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await clearDataInEmulator();
  });

  afterAll(async () => {
    await clearDataInEmulator();
    await app.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of partners', async () => {
    const partnersDtos: CreatePartnerDto[] = [
      {
        name: 'Partner 1',
        image: 'example.com',
      },
      {
        name: 'Partner 2',
        image: 'example.com',
      },
    ];

    for (const partner of partnersDtos) {
      await request(app.getHttpServer()).post('/api/partners').send(partner);
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
    const partnerDto: CreatePartnerDto = {
      name: 'Partner 1',
      image: 'example.com',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/api/partners')
      .send(partnerDto);

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
    const partnerDto: CreatePartnerDto = {
      name: 'Partner 1',
      image: 'example.com',
    };

    await request(app.getHttpServer())
      .post('/api/partners')
      .send(partnerDto)
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
    const partnerDto: CreatePartnerDto = {
      name: 'Partner 1',
      image: 'example.com',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/api/partners')
      .send(partnerDto);

    const updatedPartnerDto: UpdatePartnerDto = {
      name: 'Partner 1 - Updated',
    };

    await request(app.getHttpServer())
      .patch(`/api/partners/${createResponse.body.data.id}`)
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
        expect(res.body.data.name).not.toBe(partnerDto.name);
      });
  });

  it('should delete a partner', async () => {
    const partnerDto: CreatePartnerDto = {
      name: 'Project 1',
      image: 'example.com',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/api/partners')
      .send(partnerDto);

    await request(app.getHttpServer())
      .delete(`/api/partners/${createResponse.body.data.id}`)
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
