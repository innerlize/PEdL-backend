import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from '../projects.controller';
import { ProjectsService } from '../../application/services/projects.service';
import { CreateProjectDto } from '../../application/dtos/create-project.dto';
import { UpdateProjectDto } from '../../application/dtos/update-project.dto';
import { Project } from '../../domain/interfaces/project.interface';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: {
            getAllProjects: jest.fn(),
            getProject: jest.fn(),
            createProject: jest.fn(),
            updateProject: jest.fn(),
            deleteProject: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an array of projects', async () => {
    const result: Project[] = [
      {
        id: '1',
        name: 'Project 1',
        customer: 'Customer A',
        description: 'Project description',
        softwares: ['Software A', 'Software B'],
        start_date: new Date('2024-06-17'),
        end_date: new Date('2024-12-31'),
      },
    ];

    jest.spyOn(service, 'getAllProjects').mockResolvedValue(result);

    expect(await controller.getAllProjects()).toBe(result);
  });

  it('should return a project by id', async () => {
    const id = '1';

    const result: Project = {
      id: '1',
      name: 'Project 1',
      customer: 'Customer A',
      description: 'Project description',
      softwares: ['Software A', 'Software B'],
      start_date: new Date('2024-06-17'),
      end_date: new Date('2024-12-31'),
    };

    jest.spyOn(service, 'getProject').mockResolvedValue(result);

    expect(await controller.getProject(id)).toBe(result);
  });

  it('should create a new project', async () => {
    const createProjectDto: CreateProjectDto = {
      name: 'Project 1',
      customer: 'Customer A',
      description: 'Project description',
      softwares: ['Software A', 'Software B'],
      start_date: new Date('2024-06-17'),
      end_date: new Date('2024-12-31'),
    };

    const result = 'Project created successfully';

    jest.spyOn(service, 'createProject').mockResolvedValue(result);

    expect(await controller.createProject(createProjectDto)).toBe(result);
  });

  it('should update an existing project', async () => {
    const id = '1';

    const updateProjectDto: UpdateProjectDto = { name: 'Updated Project' };

    const result = 'Project updated successfully';

    jest.spyOn(service, 'updateProject').mockResolvedValue(result);

    expect(await controller.updateProject(id, updateProjectDto)).toBe(result);
  });

  it('should delete a project', async () => {
    const id = '1';

    const result = 'Project deleted successfully';

    jest.spyOn(service, 'deleteProject').mockResolvedValue(result);

    expect(await controller.deleteProject(id)).toBe(result);
  });
});
