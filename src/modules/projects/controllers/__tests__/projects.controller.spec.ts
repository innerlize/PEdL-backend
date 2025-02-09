import { AuthGuard } from '@common/application/guards/auth.guard';
import { CustomResponse } from '@common/domain/custom-response.interface';
import { CreateProjectDto } from '@modules/projects/application/dtos/create-project.dto';
import { UpdateProjectBasicInfoDto } from '@modules/projects/application/dtos/update-project-info.dto';
import { UpdateProjectOrderDto } from '@modules/projects/application/dtos/update-project-order.dto';
import { ProjectsMediaService } from '@modules/projects/application/services/projects-media.service';
import { ProjectsOrderService } from '@modules/projects/application/services/projects-order.service';
import { ProjectsService } from '@modules/projects/application/services/projects.service';
import { generateRandomProjects } from '@modules/projects/controllers/__tests__/utils/generate-random-projects';
import {
  generateRandomCreateProjectDtos,
  generateRandomUpdateProjectArrayFieldDtos,
  generateRandomUpdateProjectBasicInfoDtos,
  generateRandomUpdateProjectMediaDtos,
  generateRandomUpdateProjectOrderDtos,
  generateRandomUpdateProjectThumbnailsDtos,
  generateRandomUpdateProjectVisibilityDtos,
} from '@modules/projects/controllers/__tests__/utils/generate-random-projects.dto';
import { ProjectsController } from '@modules/projects/controllers/projects.controller';
import { Project } from '@modules/projects/domain/interfaces/project.interface';
import { TestingModule, Test } from '@nestjs/testing';
import { Timestamp } from '@google-cloud/firestore';
import { UpdateProjectVisibilityParams } from '@modules/projects/application/dtos/update-project-visibility.params';
import { UpdateProjectArrayFieldDto } from '@modules/projects/application/dtos/update-project-array-field.dto';
import { UpdateProjectThumbnailsDto } from '@modules/projects/application/dtos/update-project-thumbnails.dto';
import { UpdateProjectMediaDto } from '@modules/projects/application/dtos/update-project-media.dto';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let projectsService: ProjectsService;
  let projectsOrderService: ProjectsOrderService;
  let projectsMediaService: ProjectsMediaService;

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
            updateProjectBasicInfo: jest.fn(),
            updateProjectArrayField: jest.fn(),
            updateProjectThumbnails: jest.fn(),
            updateProjectMedia: jest.fn(),
            updateProjectVisibility: jest.fn(),
            updateProjectOrder: jest.fn(),
            deleteProject: jest.fn(),
            deleteFileFromProject: jest.fn(),
          },
        },
        {
          provide: ProjectsOrderService,
          useValue: {
            getHighestAvailableOrder: jest.fn(),
            updateOrder: jest.fn(),
            reorderAfterDelete: jest.fn(),
          },
        },
        {
          provide: ProjectsMediaService,
          useValue: {
            updateThumbnails: jest.fn(),
            updateMedia: jest.fn(),
            deleteFileFromProject: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ProjectsController>(ProjectsController);
    projectsService = module.get<ProjectsService>(ProjectsService);
    projectsOrderService =
      module.get<ProjectsOrderService>(ProjectsOrderService);
    projectsMediaService =
      module.get<ProjectsMediaService>(ProjectsMediaService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an array of projects', async () => {
    const EXPECTED_RESULT_LENGTH = 2;
    const EXPECTED_SERVICE_CALL_COUNT = 1;

    const projects = generateRandomProjects({ quantity: 2 });

    jest
      .spyOn(projectsService, 'getAllProjects')
      .mockResolvedValueOnce(projects);

    const response = await controller.getAllProjects();

    expect(response).toEqual(projects);
    expect(projects).toHaveLength(EXPECTED_RESULT_LENGTH);
    expect(projectsService.getAllProjects).toHaveBeenCalledTimes(
      EXPECTED_SERVICE_CALL_COUNT,
    );
  });

  it('should return a project by id', async () => {
    const EXPECTED_SERVICE_CALL_COUNT = 1;

    const project: Project = generateRandomProjects({ quantity: 1 })[0];
    const { id } = project;

    jest.spyOn(projectsService, 'getProject').mockResolvedValueOnce(project);

    const response = await controller.getProject(id);

    expect(response).toEqual(project);
    expect(projectsService.getProject).toHaveBeenCalledWith(id);
    expect(projectsService.getProject).toHaveBeenCalledTimes(
      EXPECTED_SERVICE_CALL_COUNT,
    );
  });

  it('should create a new project', async () => {
    const EXPECTED_SERVICE_CALL_COUNT = 1;

    const id = '1';
    const createProjectDto: CreateProjectDto = generateRandomCreateProjectDtos({
      quantity: 1,
    })[0];

    const mockResponse: CustomResponse = {
      message: 'Project successfully created!',
      status: 201,
      data: {
        id,
        ...createProjectDto,
        order: { pedl: 1, cofcof: 1 },
        visibility: { pedl: false, cofcof: false },
      },
    };

    jest
      .spyOn(projectsService, 'createProject')
      .mockResolvedValueOnce(mockResponse);

    const response = await controller.createProject(createProjectDto);

    expect(response).toEqual(mockResponse);
    expect(projectsService.createProject).toHaveBeenCalledWith(
      createProjectDto,
    );
    expect(projectsService.createProject).toHaveBeenCalledTimes(
      EXPECTED_SERVICE_CALL_COUNT,
    );
  });

  it('should update basic info of a project', async () => {
    const EXPECTED_SERVICE_CALL_COUNT = 1;

    const preExistingProjects = generateRandomProjects({ quantity: 2 });

    const { id, ...restOfPreExistingProject } = preExistingProjects[1];

    const updateProjectBasicInfoDto: UpdateProjectBasicInfoDto =
      generateRandomUpdateProjectBasicInfoDtos({ quantity: 1 })[0];

    const updatedProject: Project = {
      id,
      ...restOfPreExistingProject,
      ...updateProjectBasicInfoDto,
      timeframe: updateProjectBasicInfoDto.timeframe
        ? {
            start_date: Timestamp.fromDate(
              updateProjectBasicInfoDto.timeframe.start_date,
            ),
            end_date: Timestamp.fromDate(
              updateProjectBasicInfoDto.timeframe.end_date,
            ),
          }
        : restOfPreExistingProject.timeframe,
    };

    const mockResponse = {
      message: `Project successfully updated!`,
      status: 200,
      data: updatedProject,
    };

    jest
      .spyOn(projectsService, 'updateProjectBasicInfo')
      .mockResolvedValueOnce(mockResponse);

    const response = await controller.updateProjectBasicInfo(
      id,
      updateProjectBasicInfoDto,
    );

    expect(response).toEqual(mockResponse);
    expect(projectsService.updateProjectBasicInfo).toHaveBeenCalledWith(
      id,
      updateProjectBasicInfoDto,
    );
    expect(projectsService.updateProjectBasicInfo).toHaveBeenCalledTimes(
      EXPECTED_SERVICE_CALL_COUNT,
    );
  });

  it('should update an array field of a project', async () => {
    const EXPECTED_SERVICE_CALL_COUNT = 1;

    const preExistingProjects = generateRandomProjects({ quantity: 2 });

    const { id } = preExistingProjects[1];

    const updateProjectArrayFieldDto: UpdateProjectArrayFieldDto =
      generateRandomUpdateProjectArrayFieldDtos({
        quantity: 1,
      })[0];

    jest
      .spyOn(projectsService, 'updateProjectArrayField')
      .mockResolvedValueOnce();

    const response = await controller.updateProjectArrayField(
      id,
      updateProjectArrayFieldDto,
    );

    expect(response).toBeUndefined();
    expect(projectsService.updateProjectArrayField).toHaveBeenCalledWith(
      id,
      updateProjectArrayFieldDto,
    );
    expect(projectsService.updateProjectArrayField).toHaveBeenCalledTimes(
      EXPECTED_SERVICE_CALL_COUNT,
    );
  });

  it('should update the thumbnails of a project', async () => {
    const EXPECTED_SERVICE_CALL_COUNT = 1;

    const preExistingProjects = generateRandomProjects({ quantity: 2 });

    const { id } = preExistingProjects[1];

    const updateProjectThumbnailsDto: UpdateProjectThumbnailsDto =
      generateRandomUpdateProjectThumbnailsDtos({ quantity: 1 })[0];

    jest
      .spyOn(projectsMediaService, 'updateThumbnails')
      .mockResolvedValueOnce();

    const response = await controller.updateProjectThumbnails(
      id,
      updateProjectThumbnailsDto,
      {},
    );

    expect(response).toBeUndefined();
    expect(projectsMediaService.updateThumbnails).toHaveBeenCalledWith(
      id,
      updateProjectThumbnailsDto,
      {},
    );
    expect(projectsMediaService.updateThumbnails).toHaveBeenCalledTimes(
      EXPECTED_SERVICE_CALL_COUNT,
    );
  });

  it('should update the media of a project', async () => {
    const EXPECTED_SERVICE_CALL_COUNT = 1;

    const preExistingProjects = generateRandomProjects({ quantity: 2 });

    const { id } = preExistingProjects[1];

    const { images, videos }: UpdateProjectMediaDto =
      generateRandomUpdateProjectMediaDtos({ quantity: 1 })[0];

    jest.spyOn(projectsMediaService, 'updateMedia').mockResolvedValueOnce();

    const response = await controller.updateProjectMedia(
      id,
      { images, videos },
      { images: [], videos: [] },
    );

    expect(response).toBeUndefined();
    expect(projectsMediaService.updateMedia).toHaveBeenCalledWith(
      id,
      { images, videos },
      { images: [], videos: [] },
    );
    expect(projectsMediaService.updateMedia).toHaveBeenCalledTimes(
      EXPECTED_SERVICE_CALL_COUNT,
    );
  });

  it('should update the order of a project', async () => {
    const EXPECTED_SERVICE_CALL_COUNT = 1;

    const preExistingProjects = generateRandomProjects({ quantity: 2 });

    const { id } = preExistingProjects[1];

    const { currentOrder, newOrder, app }: UpdateProjectOrderDto =
      generateRandomUpdateProjectOrderDtos({
        quantity: 1,
      })[0];

    jest.spyOn(projectsOrderService, 'updateOrder').mockResolvedValueOnce();

    const response = await controller.updateProjectOrder(id, {
      currentOrder,
      newOrder,
      app,
    });

    expect(response).toBeUndefined();
    expect(projectsOrderService.updateOrder).toHaveBeenCalledWith(
      id,
      currentOrder,
      newOrder,
      app,
    );
    expect(projectsOrderService.updateOrder).toHaveBeenCalledTimes(
      EXPECTED_SERVICE_CALL_COUNT,
    );
  });

  it('should update the visibility of a project', async () => {
    const EXPECTED_SERVICE_CALL_COUNT = 1;

    const preExistingProjects = generateRandomProjects({ quantity: 2 });

    const { id: projectId } = preExistingProjects[1];

    const { id: updatedProjectId, app }: UpdateProjectVisibilityParams =
      generateRandomUpdateProjectVisibilityDtos({
        quantity: 1,
        metadata: { id: projectId },
      })[0];

    const mockResponse = {
      message: 'Project visibility successfully updated',
      status: 200,
    };

    jest
      .spyOn(projectsService, 'updateProjectVisibility')
      .mockResolvedValue(mockResponse);

    const response = await controller.updateProjectVisibility({
      id: updatedProjectId,
      app,
    });

    expect(response).toEqual(mockResponse);
    expect(projectsService.updateProjectVisibility).toHaveBeenCalledWith(
      updatedProjectId,
      app,
    );
    expect(projectsService.updateProjectVisibility).toHaveBeenCalledTimes(
      EXPECTED_SERVICE_CALL_COUNT,
    );
  });

  it('should delete a project', async () => {
    const preExistingProjects = generateRandomProjects({ quantity: 2 });

    const { id } = preExistingProjects[1];

    const mockResponse = {
      message: `Project with id "${id}" and associated files successfully deleted. Remaining projects have been reordered.`,
      status: 200,
    };

    jest
      .spyOn(projectsService, 'deleteProject')
      .mockResolvedValue(mockResponse);

    const response = await controller.deleteProject(id);

    expect(response).toEqual(mockResponse);
    expect(projectsService.deleteProject).toHaveBeenCalledWith(id);
    expect(projectsService.deleteProject).toHaveBeenCalledTimes(1);
  });

  // it('should delete a file from a project', async () => {
  //   const projectId: string = '1';
  //   const fileId: string = '1';
  //   const fileType: 'image' | 'video' = 'image';

  //   const mockResponse = { message: 'File successfully deleted', status: 200 };
  // })
});
