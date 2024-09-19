import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from '../projects.service';
import * as request from 'supertest';
import { ProjectsController } from '../../../controllers/projects.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../../../database/database.module';
import { CreateProjectDto } from '../../dtos/create-project.dto';
import { UpdateProjectDto } from '../../dtos/update-project.dto';
import { clearDataInEmulator } from '../../../../../utils/clear-data-in-emulator.util';

describe('ProjectsService', () => {
  let service: ProjectsService;
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
      providers: [ProjectsService],
      controllers: [ProjectsController],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
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

  it('should return an array of projects', async () => {
    const projects: CreateProjectDto[] = [
      {
        name: 'Project 1',
        customer: 'Customer 1',
        description: 'Description 1',
        softwares: ['Software 1', 'Software 2'],
        thumbnail: 'https://example.com/image.png',
        start_date: new Date('2023-01-01'),
        end_date: new Date('2023-06-30'),
      },
      {
        name: 'Project 2',
        customer: 'Customer 2',
        description: 'Description 2',
        softwares: ['Software 3'],
        thumbnail: 'https://example.com/image.png',
        start_date: new Date('2023-02-01'),
        end_date: new Date('2023-07-31'),
      },
    ];

    for (const project of projects) {
      await request(app.getHttpServer()).post('/api/projects').send(project);
    }

    await request(app.getHttpServer())
      .get('/api/projects')
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
              customer: expect.any(String),
              description: expect.any(String),
              softwares: expect.any(Array),
              thumbnail: expect.any(String),
              start_date: expect.anything(),
              end_date: expect.anything(),
              created_at: expect.anything(),
              updated_at: expect.anything(),
            }),
          ]),
        );
      });
  });

  it('should return a project by id', async () => {
    const project: CreateProjectDto = {
      name: 'Project 1',
      customer: 'Customer 1',
      description: 'Description 1',
      softwares: ['Software 1', 'Software 2'],
      thumbnail: 'https://example.com/image.png',
      start_date: new Date('2023-01-01'),
      end_date: new Date('2023-06-30'),
    };

    const createResponse = await request(app.getHttpServer())
      .post('/api/projects')
      .send(project);

    await request(app.getHttpServer())
      .get(`/api/projects/${createResponse.body.data.id}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            customer: expect.any(String),
            description: expect.any(String),
            softwares: expect.any(Array),
            thumbnail: expect.any(String),
            start_date: expect.anything(),
            end_date: expect.anything(),
            created_at: expect.anything(),
            updated_at: expect.anything(),
          }),
        );
      });

    await request(app.getHttpServer())
      .get(`/api/projects`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
      });
  });

  it('should create a project', async () => {
    const project: CreateProjectDto = {
      name: 'Project 1',
      customer: 'Customer 1',
      description: 'Description 1',
      softwares: ['Software 1', 'Software 2'],
      thumbnail: 'https://example.com/image.png',
      start_date: new Date('2023-01-01'),
      end_date: new Date('2023-06-30'),
    };

    await request(app.getHttpServer())
      .post('/api/projects')
      .send(project)
      .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body).toEqual(
          expect.objectContaining({
            message: expect.any(String),
            status: expect.any(Number),
            data: expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
              customer: expect.any(String),
              description: expect.any(String),
              softwares: expect.any(Array),
              thumbnail: expect.any(String),
              start_date: expect.anything(),
              end_date: expect.anything(),
              created_at: expect.anything(),
              updated_at: expect.anything(),
            }),
          }),
        );
      });
  });

  it('should update a project', async () => {
    const project: CreateProjectDto = {
      name: 'Project 1',
      customer: 'Customer 1',
      description: 'Description 1',
      softwares: ['Software 1', 'Software 2'],
      thumbnail: 'https://example.com/image.png',
      start_date: new Date('2023-01-01'),
      end_date: new Date('2023-06-30'),
    };

    const createResponse = await request(app.getHttpServer())
      .post('/api/projects')
      .send(project);

    const updatedProjectDto: UpdateProjectDto = {
      name: 'Project 1 - Updated',
    };

    await request(app.getHttpServer())
      .patch(`/api/projects/${createResponse.body.data.id}`)
      .send(updatedProjectDto)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.objectContaining({
            message: expect.any(String),
            status: expect.any(Number),
            data: expect.objectContaining({
              name: updatedProjectDto.name,
            }),
          }),
        );
        expect(res.body.data.name).not.toBe(project.name);
      });
  });

  it('should delete a project', async () => {
    const project: CreateProjectDto = {
      name: 'Project 1',
      customer: 'Customer 1',
      description: 'Description 1',
      softwares: ['Software 1', 'Software 2'],
      thumbnail: 'https://example.com/image.png',
      start_date: new Date('2023-01-01'),
      end_date: new Date('2023-06-30'),
    };

    const createResponse = await request(app.getHttpServer())
      .post('/api/projects')
      .send(project);

    await request(app.getHttpServer())
      .delete(`/api/projects/${createResponse.body.data.id}`)
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
