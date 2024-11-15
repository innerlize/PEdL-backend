import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { UpdateProjectDto } from '../dtos/update-project.dto';
import { CustomResponse } from '../../../../common/domain/custom-response.interface';
import { ProjectEntity as Project } from '../../domain/entities/project.entity';
import { DatabaseRepository } from 'src/common/domain/database-repository.interface';
import { ProjectsOrderService } from './projects-order.service';
import { UpdateProjectOrderDto } from '../dtos/update-project-order.dto';
import { StorageRepository } from 'src/common/domain/storage-repository.interface';
import {
  mapCreateProjectDtoToProject,
  mapUpdateProjectDtoToProject,
} from '../mappers/from-dto-to-project.mapper';
import { AppNames } from '../../../../common/domain/app-names.enum';

@Injectable()
export class ProjectsService {
  private readonly collectionName = 'projects';

  constructor(
    @Inject('DatabaseRepository')
    private readonly databaseRepository: DatabaseRepository<Project>,
    @Inject('StorageRepository')
    private readonly storageRepository: StorageRepository,
    private readonly projectOrderService: ProjectsOrderService,
  ) {}

  private async projectAlreadyExists(projectName: string): Promise<boolean> {
    try {
      const projectsWithSameName = await this.databaseRepository.findByQuery(
        this.collectionName,
        {
          field: 'name',
          operator: '==',
          value: projectName ?? '',
        },
      );

      return projectsWithSameName.length > 0;
    } catch (e) {
      throw new Error('Error checking project name ' + e);
    }
  }

  private createResponse(
    message: string,
    status: number,
    data?: any,
  ): CustomResponse {
    return { message, status, data };
  }

  async getAllProjects(): Promise<Project[]> {
    return await this.databaseRepository.findAll(this.collectionName);
  }

  async getProject(id: string): Promise<Project> {
    const project = await this.databaseRepository.findById(
      this.collectionName,
      id,
    );

    if (!project) throw new NotFoundException('Project not found');

    return project;
  }

  async createProject(
    createProjectDto: CreateProjectDto,
  ): Promise<CustomResponse> {
    try {
      const projectAlreadyExists = await this.projectAlreadyExists(
        createProjectDto.name,
      );

      if (projectAlreadyExists) {
        throw new ConflictException(
          `A project with name "${createProjectDto.name}" already exists.`,
        );
      }

      const projectDtoMapper: Omit<
        Project,
        'id' | 'start_date' | 'end_date' | 'order' | 'media' | 'visibility'
      > = mapCreateProjectDtoToProject(createProjectDto);

      const projectDtoWithInitialOrder =
        await this.projectOrderService.assignInitialOrder(
          this.collectionName,
          projectDtoMapper,
        );

      const projectRef = await this.databaseRepository.create(
        this.collectionName,
        {
          ...projectDtoWithInitialOrder,
          visibility: { pedl: false, cofcof: false },
        },
      );

      const storageImagesDirectoryPath = `projects/${projectRef.id}/media/images`;
      const storageVideosDirectoryPath = `projects/${projectRef.id}/media/videos`;

      const uploadedImages = createProjectDto.imagesFiles?.length
        ? await this.storageRepository.uploadFiles(
            storageImagesDirectoryPath,
            createProjectDto.imagesFiles,
          )
        : [];

      const uploadedVideos = createProjectDto.videosFiles?.length
        ? await this.storageRepository.uploadFiles(
            storageVideosDirectoryPath,
            createProjectDto.videosFiles,
          )
        : [];

      const finalImagesUrls = [
        ...(createProjectDto.imagesUrls || []),
        ...uploadedImages,
      ];
      const finalVideosUrls = [
        ...(createProjectDto.videosUrls || []),
        ...uploadedVideos,
      ];

      const updatedProjectData = {
        ...projectDtoWithInitialOrder,
        media: {
          images: finalImagesUrls,
          videos: finalVideosUrls,
        },
      };

      await this.databaseRepository.update(
        this.collectionName,
        projectRef.id,
        updatedProjectData,
      );

      const finalProject = await this.databaseRepository.findById(
        this.collectionName,
        projectRef.id,
      );

      return this.createResponse(
        'Project successfully created!',
        201,
        finalProject,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateProject(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<CustomResponse> {
    const project = await this.databaseRepository.findById(
      this.collectionName,
      id,
    );

    if (!project) throw new NotFoundException('Project not found');

    const projectDtoMapper: Partial<
      Omit<Project, 'id' | 'start_date' | 'end_date' | 'order'>
    > = mapUpdateProjectDtoToProject(updateProjectDto);

    const projectNameWasChanged = project.name !== updateProjectDto.name;
    const projectNameIsAlreadyInUse = await this.projectAlreadyExists(
      updateProjectDto.name,
    );

    if (projectNameWasChanged && projectNameIsAlreadyInUse) {
      throw new ConflictException(
        `A project with name "${updateProjectDto.name}" already exists.`,
      );
    }

    try {
      const projectRef = await this.databaseRepository.getDocumentReference(
        this.collectionName,
        id,
      );

      if (updateProjectDto.imagesFiles?.length) {
        const storageImagesDirectoryPath = `projects/${projectRef.id}/media/images`;
        const uploadedImages = await this.storageRepository.uploadFiles(
          storageImagesDirectoryPath,
          updateProjectDto.imagesFiles,
        );

        await this.databaseRepository.appendMediaUrls(
          this.collectionName,
          id,
          'images',
          [...(updateProjectDto.imagesUrls ?? []), ...uploadedImages],
        );
      } else if (updateProjectDto.imagesUrls?.length) {
        await this.databaseRepository.appendMediaUrls(
          this.collectionName,
          id,
          'images',
          updateProjectDto.imagesUrls,
        );
      }

      if (updateProjectDto.videosFiles?.length) {
        const storageVideosDirectoryPath = `projects/${projectRef.id}/media/videos`;
        const uploadedVideos = await this.storageRepository.uploadFiles(
          storageVideosDirectoryPath,
          updateProjectDto.videosFiles,
        );

        await this.databaseRepository.appendMediaUrls(
          this.collectionName,
          id,
          'videos',
          [...(updateProjectDto.videosUrls ?? []), ...uploadedVideos],
        );
      } else if (updateProjectDto.videosUrls?.length) {
        await this.databaseRepository.appendMediaUrls(
          this.collectionName,
          id,
          'videos',
          updateProjectDto.videosUrls,
        );
      }

      try {
        const updatedProject = await this.databaseRepository.update(
          this.collectionName,
          id,
          projectDtoMapper,
        );

        return this.createResponse(
          'Project successfully updated!',
          200,
          updatedProject,
        );
      } catch (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error updating project', error);
    }
  }

  async updateProjectOrder(
    id: string,
    { newOrder, app }: UpdateProjectOrderDto,
  ): Promise<CustomResponse> {
    await this.projectOrderService.updateOrder(
      this.collectionName,
      id,
      newOrder,
      app,
    );

    return this.createResponse(`Project order updated successfully!`, 200);
  }

  async updateProjectVisibility(id: string, app: AppNames): Promise<void> {
    const project = await this.databaseRepository.findById(
      this.collectionName,
      id,
    );

    if (!project) throw new NotFoundException('Project not found');

    const updatedVisibility = !project.visibility?.[app];

    await this.databaseRepository.update(this.collectionName, id, {
      [`visibility.${app}`]: updatedVisibility,
    });
  }

  async deleteProject(id: string): Promise<CustomResponse> {
    const project = await this.databaseRepository.findById(
      this.collectionName,
      id,
    );

    await this.databaseRepository.delete(this.collectionName, id);

    await this.projectOrderService.reorderAfterDelete(
      this.collectionName,
      project.order,
    );

    await this.storageRepository.deleteAllFilesFromFolder(
      'projects',
      project.id,
    );

    return this.createResponse(
      `Project with id "${id}" and associated files successfully deleted. Remaining projects have been reordered.`,
      200,
    );
  }

  async deleteFileFromProject(
    id: string,
    fileUrl: string,
    fileType: 'image' | 'video',
  ): Promise<void> {
    const project = await this.databaseRepository.findById(
      this.collectionName,
      id,
    );

    const removeFileUrlFromMedia = (type: 'image' | 'video') => {
      if (type === 'image') {
        project.media.images = project.media.images.filter(
          (imagePath) => imagePath !== fileUrl,
        );
      } else {
        project.media.videos = project.media.videos.filter(
          (videoPath) => videoPath !== fileUrl,
        );
      }
    };

    try {
      await this.storageRepository.deleteFile(fileUrl);
      removeFileUrlFromMedia(fileType);
    } catch (error) {
      if (
        error.message.includes('No such object') ||
        error.message.includes('Invalid file URL')
      ) {
        console.warn(
          'File URL not found in storage, removing URL from project media...',
        );
        removeFileUrlFromMedia(fileType);
      } else {
        throw error;
      }
    }

    await this.databaseRepository.update(this.collectionName, id, project);
  }
}
