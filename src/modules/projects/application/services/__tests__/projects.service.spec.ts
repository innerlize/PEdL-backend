import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from '../projects.service';
import * as request from 'supertest';
import { ProjectsController } from '../../../controllers/projects.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../../../database/database.module';
import { CreateProjectDto } from '../../dtos/create-project.dto';
import { UpdateProjectDto } from '../../dtos/update-project.dto';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { AuthModule } from '../../../../auth/auth.module';
import {
  clearAuth,
  loginAsAdmin,
} from '../../../../../common/utils/admin-auth-test.utils';
import { AuthGuard } from '../../../../../common/application/guards/auth.guard';
import { ProjectsOrderService } from '../projects-order.service';
import { UpdateProjectOrderDto } from '../../dtos/update-project-order.dto';
import { AppNames } from '../../../../../common/domain/app-names.enum';
import { StorageModule } from '../../../../storage/storage.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { UpdateProjectVisibilityParams } from '../../dtos/update-project-visibility.params';

describe('ProjectsService', () => {
  let service: ProjectsService;
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
        NestjsFormDataModule,
        StorageModule,
        AuthModule,
      ],
      providers: [ProjectsService, ProjectsOrderService],
      controllers: [ProjectsController],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    testEnv = await initializeTestEnvironment({
      projectId: process.env.GCLOUD_PROJECT,
    });

    service = module.get<ProjectsService>(ProjectsService);
    app = module.createNestApplication();

    await app.init();
  });

  beforeEach(async () => {
    await clearAuth();
    testIdToken = '';
    await testEnv.clearFirestore();
    await testEnv.clearStorage();

    const idToken = await loginAsAdmin();
    testIdToken = idToken;
  });

  afterAll(async () => {
    await clearAuth();
    testIdToken = '';
    await testEnv.clearFirestore();
    await testEnv.clearStorage();
    await testEnv.cleanup();
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
      await request(app.getHttpServer())
        .post('/api/projects')
        .set('Authorization', `Bearer ${testIdToken}`)
        .send(project);
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
              order: expect.objectContaining({
                pedl: expect.any(Number),
                cofcof: expect.any(Number),
              }),
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
      .set('Authorization', `Bearer ${testIdToken}`)
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
            order: expect.objectContaining({
              pedl: expect.any(Number),
              cofcof: expect.any(Number),
            }),
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
      .set('Authorization', `Bearer ${testIdToken}`)
      .send(project)
      .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body).toEqual(
          expect.objectContaining({
            data: expect.objectContaining({
              customer: expect.any(String),
              description: expect.any(String),
              end_date: expect.any(String),
              id: expect.any(String),
              name: expect.any(String),
              order: expect.objectContaining({
                cofcof: expect.any(Number),
                pedl: expect.any(Number),
              }),
              softwares: expect.arrayContaining([expect.any(String)]),
              start_date: expect.any(String),
              thumbnail: expect.any(String),
            }),
            message: expect.any(String),
            status: expect.any(Number),
          }),
        );
      });
  });

  describe('Project update', () => {
    beforeEach(async () => {
      await testEnv.clearStorage();
    });

    it('should successfully update a property of a project', async () => {
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
        .set('Authorization', `Bearer ${testIdToken}`)
        .send(project);

      const updatedProjectDto: UpdateProjectDto = {
        name: 'Project 1 - Updated',
      };

      await request(app.getHttpServer())
        .patch(`/api/projects/${createResponse.body.data.id}`)
        .set('Authorization', `Bearer ${testIdToken}`)
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

    it('should successfully update the visibility of a project', async () => {
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
        .set('Authorization', `Bearer ${testIdToken}`)
        .send(project);

      const updateProjectVisibilityParams: UpdateProjectVisibilityParams = {
        id: createResponse.body.data.id,
        app: AppNames.PEDL,
      };

      await request(app.getHttpServer())
        .patch(
          `/api/projects/${updateProjectVisibilityParams.id}/visibility/${updateProjectVisibilityParams.app}`,
        )
        .set('Authorization', `Bearer ${testIdToken}`)
        .send()
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toEqual(
            expect.objectContaining({
              message: expect.any(String),
              status: expect.any(Number),
            }),
          );
        });

      await request(app.getHttpServer())
        .get(`/api/projects/${updateProjectVisibilityParams.id}`)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toEqual(
            expect.objectContaining({
              id: updateProjectVisibilityParams.id,
              name: project.name,
              visibility: expect.objectContaining({
                pedl: !createResponse.body.data.visibility.pedl,
                cofcof: expect.any(Boolean),
              }),
            }),
          );
        });
    });

    it("should successfully upload a new file and update project's media property", async () => {
      const project: CreateProjectDto = {
        name: 'Project 1',
        customer: 'Customer 1',
        description: 'Description 1',
        softwares: ['Software 1', 'Software 2'],
        thumbnail: 'https://example.com/image.png',
        imagesUrls: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
        ],
        start_date: new Date('2023-01-01'),
        end_date: new Date('2023-06-30'),
      };

      const fileName = 'mock-image.jpg';

      const createResponse = await request(app.getHttpServer())
        .post('/api/projects')
        .set('Authorization', `Bearer ${testIdToken}`)
        .send(project);

      await request(app.getHttpServer())
        .patch(`/api/projects/${createResponse.body.data.id}`)
        .set('Authorization', `Bearer ${testIdToken}`)
        .field('name', 'Updated Project Name')
        .attach('imagesFiles[]', Buffer.from('...'), {
          filename: fileName,
          contentType: 'image/jpeg',
        })
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({
              message: 'Project successfully updated!',
              status: 200,
              data: expect.objectContaining({
                id: expect.any(String),
                name: expect.any(String),
                customer: expect.any(String),
                description: expect.any(String),
                softwares: expect.arrayContaining([expect.any(String)]),
                media: expect.objectContaining({
                  images: expect.arrayContaining([
                    ...project.imagesUrls,
                    expect.stringContaining(fileName),
                  ]),
                }),
                start_date: expect.any(String),
                end_date: expect.any(String),
                thumbnail: expect.any(String),
                order: expect.objectContaining({
                  cofcof: expect.any(Number),
                  pedl: expect.any(Number),
                }),
                created_at: expect.objectContaining({
                  _seconds: expect.any(Number),
                  _nanoseconds: expect.any(Number),
                }),
                updated_at: expect.objectContaining({
                  _seconds: expect.any(Number),
                  _nanoseconds: expect.any(Number),
                }),
              }),
            }),
          );

          expect(res.body.data.images).not.toEqual([]);
          expect(res.body.data.images).not.toBe(
            createResponse.body.data.media.images,
          );
        });
    });

    it("should successfully upload a new video and update project's media property", async () => {
      const project: CreateProjectDto = {
        name: 'Project 1',
        customer: 'Customer 1',
        description: 'Description 1',
        softwares: ['Software 1', 'Software 2'],
        thumbnail: 'https://example.com/image.png',
        videosUrls: [
          'https://example.com/video1.mp4',
          'https://example.com/video2.mp4',
        ],
        start_date: new Date('2023-01-01'),
        end_date: new Date('2023-06-30'),
      };

      const fileName = 'mock-video.mp4';

      const createResponse = await request(app.getHttpServer())
        .post('/api/projects')
        .set('Authorization', `Bearer ${testIdToken}`)
        .send(project);

      await request(app.getHttpServer())
        .patch(`/api/projects/${createResponse.body.data.id}`)
        .set('Authorization', `Bearer ${testIdToken}`)
        .field('name', 'Updated Project Name')
        .attach('videosFiles[]', Buffer.from('...'), {
          filename: fileName,
          contentType: 'video/mp4',
        })
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({
              message: 'Project successfully updated!',
              status: 200,
              data: expect.objectContaining({
                id: expect.any(String),
                name: expect.any(String),
                customer: expect.any(String),
                description: expect.any(String),
                softwares: expect.arrayContaining([expect.any(String)]),
                media: expect.objectContaining({
                  videos: expect.arrayContaining([
                    ...project.videosUrls,
                    expect.stringContaining(fileName),
                  ]),
                }),
                start_date: expect.any(String),
                end_date: expect.any(String),
                thumbnail: expect.any(String),
                order: expect.objectContaining({
                  cofcof: expect.any(Number),
                  pedl: expect.any(Number),
                }),
                created_at: expect.objectContaining({
                  _seconds: expect.any(Number),
                  _nanoseconds: expect.any(Number),
                }),
                updated_at: expect.objectContaining({
                  _seconds: expect.any(Number),
                  _nanoseconds: expect.any(Number),
                }),
              }),
            }),
          );

          expect(res.body.data.videos).not.toEqual([]);
          expect(res.body.data.videos).not.toBe(
            createResponse.body.data.media.videos,
          );
        });
    });
  });

  describe('Project order', () => {
    describe('PEdL App', () => {
      it('should update a project order for PEdL app', async () => {
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
          .set('Authorization', `Bearer ${testIdToken}`)
          .send(project);

        const updatedProjectDto: UpdateProjectOrderDto = {
          newOrder: 2,
          app: AppNames.PEDL,
        };

        await request(app.getHttpServer())
          .patch(`/api/projects/${createResponse.body.data.id}/order`)
          .set('Authorization', `Bearer ${testIdToken}`)
          .send(updatedProjectDto)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toEqual(
              expect.objectContaining({
                message: expect.any(String),
                status: expect.any(Number),
              }),
            );
          });

        await request(app.getHttpServer())
          .get(`/api/projects/${createResponse.body.data.id}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toEqual(
              expect.objectContaining({
                id: createResponse.body.data.id,
                order: expect.objectContaining({
                  pedl: updatedProjectDto.newOrder,
                  cofcof: createResponse.body.data.order.cofcof,
                }),
              }),
            );
          });
      });

      it('should reorder remaining projects for PEdL app', async () => {
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
            customer: 'Customer 1',
            description: 'Description 1',
            softwares: ['Software 1', 'Software 2'],
            thumbnail: 'https://example.com/image.png',
            start_date: new Date('2023-01-01'),
            end_date: new Date('2023-06-30'),
          },
        ];

        for (const project of projects) {
          await request(app.getHttpServer())
            .post('/api/projects')
            .set('Authorization', `Bearer ${testIdToken}`)
            .send(project);
        }

        const projectWithLowestOrderForPEdL = await request(app.getHttpServer())
          .get('/api/projects')
          .then((res) => {
            return res.body.reduce((minProject, currentProject) =>
              currentProject.order.pedl < minProject.order.pedl
                ? currentProject
                : minProject,
            );
          });

        const updatedProjectOrderDto: UpdateProjectOrderDto = {
          newOrder: 2,
          app: AppNames.PEDL,
        };

        await request(app.getHttpServer())
          .patch(`/api/projects/${projectWithLowestOrderForPEdL.id}/order`)
          .set('Authorization', `Bearer ${testIdToken}`)
          .send(updatedProjectOrderDto)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toEqual(
              expect.objectContaining({
                message: expect.any(String),
                status: expect.any(Number),
              }),
            );
          });

        await request(app.getHttpServer())
          .get('/api/projects')
          .then((res) => {
            const sortedProjects = res.body
              .filter((p) => p.order.pedl)
              .sort((a, b) => a.order.pedl - b.order.pedl);

            expect(sortedProjects[1].id).toBe(projectWithLowestOrderForPEdL.id);
            expect(sortedProjects[0].order.pedl).toBe(1);
            expect(sortedProjects[1].order.pedl).toBe(2);
          });
      });
    });

    describe('CofCof App', () => {
      it('should update a project order for CofCof app', async () => {
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
          .set('Authorization', `Bearer ${testIdToken}`)
          .send(project);

        const updatedProjectDto: UpdateProjectOrderDto = {
          newOrder: 2,
          app: AppNames.COFCOF,
        };

        await request(app.getHttpServer())
          .patch(`/api/projects/${createResponse.body.data.id}/order`)
          .set('Authorization', `Bearer ${testIdToken}`)
          .send(updatedProjectDto)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toEqual(
              expect.objectContaining({
                message: expect.any(String),
                status: expect.any(Number),
              }),
            );
          });

        await request(app.getHttpServer())
          .get(`/api/projects/${createResponse.body.data.id}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toEqual(
              expect.objectContaining({
                id: createResponse.body.data.id,
                order: expect.objectContaining({
                  pedl: createResponse.body.data.order.pedl,
                  cofcof: updatedProjectDto.newOrder,
                }),
              }),
            );
          });
      });

      it('should reorder remaining projects for CofCof app', async () => {
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
            customer: 'Customer 1',
            description: 'Description 1',
            softwares: ['Software 1', 'Software 2'],
            thumbnail: 'https://example.com/image.png',
            start_date: new Date('2023-01-01'),
            end_date: new Date('2023-06-30'),
          },
        ];

        for (const project of projects) {
          await request(app.getHttpServer())
            .post('/api/projects')
            .set('Authorization', `Bearer ${testIdToken}`)
            .send(project);
        }

        const projectWithLowestOrderForCofCof = await request(
          app.getHttpServer(),
        )
          .get('/api/projects')
          .then((res) => {
            return res.body.reduce((minProject, currentProject) =>
              currentProject.order.cofcof < minProject.order.cofcof
                ? currentProject
                : minProject,
            );
          });

        const updatedProjectOrderDto: UpdateProjectOrderDto = {
          newOrder: 2,
          app: AppNames.COFCOF,
        };

        await request(app.getHttpServer())
          .patch(`/api/projects/${projectWithLowestOrderForCofCof.id}/order`)
          .set('Authorization', `Bearer ${testIdToken}`)
          .send(updatedProjectOrderDto)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toEqual(
              expect.objectContaining({
                message: expect.any(String),
                status: expect.any(Number),
              }),
            );
          });

        await request(app.getHttpServer())
          .get('/api/projects')
          .then((res) => {
            const sortedProjects = res.body
              .filter((p) => p.order.cofcof)
              .sort((a, b) => a.order.cofcof - b.order.cofcof);

            expect(sortedProjects[1].id).toBe(
              projectWithLowestOrderForCofCof.id,
            );
            expect(sortedProjects[0].order.cofcof).toBe(1);
            expect(sortedProjects[1].order.cofcof).toBe(2);
          });
      });
    });

    it('should throw an error if the project already has the target order', async () => {
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
        .set('Authorization', `Bearer ${testIdToken}`)
        .send(project);

      const updatedProjectDto: UpdateProjectOrderDto = {
        newOrder: 1,
        app: AppNames.PEDL,
      };

      await request(app.getHttpServer())
        .patch(`/api/projects/${createResponse.body.data.id}/order`)
        .set('Authorization', `Bearer ${testIdToken}`)
        .send(updatedProjectDto)
        .then((res) => {
          expect(res.status).toBe(409);
          expect(res.body).toEqual(
            expect.objectContaining({
              message: expect.any(String),
              statusCode: expect.any(Number),
            }),
          );
        });
    });

    it('should throw an error if the project does not exist', async () => {
      const updatedProjectDto: UpdateProjectOrderDto = {
        newOrder: 1,
        app: AppNames.PEDL,
      };

      await request(app.getHttpServer())
        .patch(`/api/projects/9999/order`)
        .set('Authorization', `Bearer ${testIdToken}`)
        .send(updatedProjectDto)
        .then((res) => {
          expect(res.status).toBe(404);
          expect(res.body).toEqual(
            expect.objectContaining({
              message: expect.any(String),
              statusCode: expect.any(Number),
            }),
          );
        });
    });

    it('should reorder projects after a project is deleted', async () => {
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
        {
          name: 'Project 3',
          customer: 'Customer 3',
          description: 'Description 3',
          softwares: ['Software 4'],
          thumbnail: 'https://example.com/image.png',
          start_date: new Date('2023-03-01'),
          end_date: new Date('2023-08-31'),
        },
      ];

      for (const project of projects) {
        await request(app.getHttpServer())
          .post('/api/projects')
          .set('Authorization', `Bearer ${testIdToken}`)
          .send(project);
      }

      const projectWithLowestOrders = await request(app.getHttpServer())
        .get('/api/projects')
        .then((res) => {
          return res.body.reduce((minProject, currentProject) => {
            const minOrderSum = minProject.order.pedl + minProject.order.cofcof;
            const currentOrderSum =
              currentProject.order.pedl + currentProject.order.cofcof;
            return currentOrderSum < minOrderSum ? currentProject : minProject;
          });
        });

      await request(app.getHttpServer())
        .delete(`/api/projects/${projectWithLowestOrders.id}`)
        .set('Authorization', `Bearer ${testIdToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/api/projects')
        .then((res) => {
          const remainingProjects = res.body;

          expect(res.status).toBe(200);
          expect(remainingProjects).toHaveLength(2);

          const orders = remainingProjects.map((project) => project.order);

          expect(orders).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ pedl: 1, cofcof: 1 }),
              expect.objectContaining({ pedl: 2, cofcof: 2 }),
            ]),
          );
        });
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
      .set('Authorization', `Bearer ${testIdToken}`)
      .send(project);

    await request(app.getHttpServer())
      .delete(`/api/projects/${createResponse.body.data.id}`)
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
