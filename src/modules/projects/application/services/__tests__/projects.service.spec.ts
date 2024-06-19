import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from '../projects.service';
import { CreateProjectDto } from '../../dtos/create-project.dto';
import { UpdateProjectDto } from '../../dtos/update-project.dto';
import * as request from 'supertest';
import { Project } from '../../../domain/interfaces/project.interface';
import { ProjectsController } from '../../../controllers/projects.controller';

describe('ProjectsService (integration)', () => {
  let service: ProjectsService;
  let app: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: 'DatabaseRepository',
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
      controllers: [ProjectsController],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProjects', () => {
    it('should return an array of projects', async () => {
      const projects: Project[] = [
        {
          id: '1',
          name: 'Project 1',
          customer: 'Customer 1',
          description: 'Description 1',
          softwares: ['Software 1', 'Software 2'],
          start_date: new Date('2023-01-01'),
          end_date: new Date('2023-06-30'),
        },
        {
          id: '2',
          name: 'Project 2',
          customer: 'Customer 2',
          description: 'Description 2',
          softwares: ['Software 3'],
          start_date: new Date('2023-02-01'),
          end_date: new Date('2023-07-31'),
        },
      ];

      jest.spyOn(service, 'getAllProjects').mockResolvedValue(projects);

      const response = await request(app.getHttpServer()).get('/api/projects');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            customer: expect.any(String),
            description: expect.any(String),
            end_date: expect.any(String),
            id: expect.any(String),
            name: expect.any(String),
            softwares: expect.any(Array),
            start_date: expect.any(String),
          }),
        ]),
      );
    });
  });

  describe('getProject', () => {
    it('should return a project by ID', async () => {
      const projectId = '1';
      const project: Project = {
        id: '1',
        name: 'Project 1',
        customer: 'Customer A',
        description: 'Project description',
        softwares: ['Software A', 'Software B'],
        start_date: new Date('2024-06-17'),
        end_date: new Date('2024-12-31'),
      };

      jest.spyOn(service, 'getProject').mockResolvedValue(project);

      const response = await request(app.getHttpServer()).get(
        `/api/projects/${projectId}`,
      );

      expect(response.status).toBe(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          customer: expect.any(String),
          description: expect.any(String),
          end_date: expect.any(String),
          id: expect.any(String),
          name: expect.any(String),
          softwares: expect.any(Array),
          start_date: expect.any(String),
        }),
      );
    });
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const projectId = '1';
      const createProjectDto: CreateProjectDto = {
        name: 'Project 1',
        customer: 'Customer A',
        description: 'Project description',
        softwares: ['Software A', 'Software B'],
        start_date: new Date('2024-06-17'),
        end_date: new Date('2024-12-31'),
      };

      const resultMock = {
        message: 'Project successfully created!',
        status: 201,
        data: { id: projectId, ...createProjectDto },
      };

      jest.spyOn(service, 'createProject').mockResolvedValue(resultMock);

      const response = await request(app.getHttpServer())
        .post('/api/projects')
        .send(createProjectDto);

      expect(response.status).toBe(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          message: expect.any(String),
          status: expect.any(Number),
          data: expect.objectContaining({
            customer: expect.any(String),
            description: expect.any(String),
            end_date: expect.any(String),
            id: expect.any(String),
            name: expect.any(String),
            softwares: expect.any(Array),
            start_date: expect.any(String),
          }),
        }),
      );
    });
  });

  describe('updateProject', () => {
    it('should update an existing project', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'Project 1',
        customer: 'Customer A',
        description: 'Project description',
        softwares: ['Software A', 'Software B'],
        start_date: new Date('2024-06-17'),
        end_date: new Date('2024-12-31'),
      };
      const updateProjectDto: UpdateProjectDto = { name: 'Updated Project' };

      const createResponse = await request(app.getHttpServer())
        .post('/api/projects')
        .send(createProjectDto);

      const projectId = createResponse.body.data.id;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { name, ...createProjectDtoWithoutName } = createProjectDto;

      const resultMock = {
        message: 'Project successfully updated!',
        status: 201,
        data: {
          id: projectId,
          name: updateProjectDto.name,
          ...createProjectDtoWithoutName,
        },
      };

      jest.spyOn(service, 'updateProject').mockResolvedValue(resultMock);

      const response = await request(app.getHttpServer())
        .patch(`/api/projects/${projectId}`)
        .send(updateProjectDto);

      expect(response.status).toBe(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          message: expect.any(String),
          status: expect.any(Number),
          data: expect.objectContaining({
            customer: expect.any(String),
            description: expect.any(String),
            end_date: expect.any(String),
            id: expect.any(String),
            name: updateProjectDto.name,
            softwares: expect.any(Array),
            start_date: expect.any(String),
          }),
        }),
      );
    });
  });

  describe('deleteProject', () => {
    it('should delete an existing project', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'Project 1',
        customer: 'Customer A',
        description: 'Project description',
        softwares: ['Software A', 'Software B'],
        start_date: new Date('2024-06-17'),
        end_date: new Date('2024-12-31'),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/projects')
        .send(createProjectDto);

      const projectId = createResponse.body.data.id;

      const resultMock = {
        message: `Project with ID "${projectId}" successfully updated!`,
        status: 200,
      };

      jest.spyOn(service, 'deleteProject').mockResolvedValue(resultMock);

      const response = await request(app.getHttpServer()).delete(
        `/api/projects/${projectId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: expect.any(String),
          status: expect.any(Number),
        }),
      );
      expect(response.body).not.toHaveProperty('data', expect.any(Object));
    });
  });
});
