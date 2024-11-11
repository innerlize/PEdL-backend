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
        'id' | 'start_date' | 'end_date' | 'order' | 'media'
      > = mapCreateProjectDtoToProject(createProjectDto);

      const projectDtoWithInitialOrder =
        await this.projectOrderService.assignInitialOrder(
      this.collectionName,
          projectDtoMapper,
    );

      const projectRef = await this.databaseRepository.create(
      this.collectionName,
        { ...projectDtoWithInitialOrder },
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

      return this.createResponse('Project successfully created!', 201, {
        id: projectRef.id,
        ...updatedProjectData,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateProject(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<CustomResponse> {
    const updatedProject = await this.databaseRepository.update(
      this.collectionName,
      id,
      updateProjectDto,
    );
    return this.createResponse(
      `Project with id "${id}" successfully updated!`,
      200,
      updatedProject,
    );
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

    return this.createResponse(
      `Project with id "${id}" successfully deleted!`,
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
