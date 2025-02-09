import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { CustomResponse } from '../../../../common/domain/custom-response.interface';
import { ProjectEntity as Project } from '../../domain/entities/project.entity';
import { DatabaseRepository } from 'src/common/domain/database-repository.interface';
import { ProjectsOrderService } from './projects-order.service';
import { StorageRepository } from 'src/common/domain/storage-repository.interface';
import { AppNames } from '../../../../common/domain/app-names.enum';
import { fromCreateProjectDtoToProject } from '@modules/projects/application/mappers/from-dto-to-project.mapper';
import { UpdateProjectBasicInfoDto } from '@modules/projects/application/dtos/update-project-info.dto';
import { UpdateProjectArrayFieldDto } from '@modules/projects/application/dtos/update-project-array-field.dto';

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
    const projects = await this.databaseRepository.findAll(this.collectionName);

    return await Promise.all(
      projects.map(async (project) => {
        const [images, videos] = await Promise.all([
          this.databaseRepository.getSubcollectionData(
            this.collectionName,
            project.id,
            'images',
          ),
          this.databaseRepository.getSubcollectionData(
            this.collectionName,
            project.id,
            'videos',
          ),
        ]);

        return {
          ...project,
          media: { images, videos },
        };
      }),
    );
  }

  async getProject(id: string): Promise<Project> {
    const project = await this.databaseRepository.findById(
      this.collectionName,
      id,
    );

    if (!project) throw new NotFoundException('Project not found');

    const [images, videos] = await Promise.all([
      this.databaseRepository.getSubcollectionData(
        this.collectionName,
        project.id,
        'images',
      ),
      this.databaseRepository.getSubcollectionData(
        this.collectionName,
        project.id,
        'videos',
      ),
    ]);

    return {
      ...project,
      media: { images, videos },
    };
  }

  async createProject(
    createProjectDto: CreateProjectDto,
  ): Promise<CustomResponse> {
    const projectAlreadyExists = await this.projectAlreadyExists(
      createProjectDto.name,
    );

    if (projectAlreadyExists) {
      throw new ConflictException(
        `A project with name "${createProjectDto.name}" already exists.`,
      );
    }

    const initialOrder =
      await this.projectOrderService.getHighestAvailableOrder();

    const mappedProject = fromCreateProjectDtoToProject(
      createProjectDto,
      initialOrder,
    );

    const createdProject = await this.databaseRepository.create(
      this.collectionName,
      mappedProject,
    );

    return this.createResponse(
      'Project successfully created!',
      201,
      createdProject,
    );
  }

  async updateProjectBasicInfo(
    id: string,
    updateProjectBasicInfoDto: UpdateProjectBasicInfoDto,
  ): Promise<CustomResponse> {
    const project = await this.databaseRepository.findById(
      this.collectionName,
      id,
    );

    if (!project) throw new NotFoundException('Project not found');

    const projectNameWasChanged =
      project.name !== updateProjectBasicInfoDto.name;
    const projectNameIsAlreadyInUse = await this.projectAlreadyExists(
      updateProjectBasicInfoDto.name,
    );

    if (projectNameWasChanged && projectNameIsAlreadyInUse) {
      throw new ConflictException(
        `A project with name "${updateProjectBasicInfoDto.name}" already exists.`,
      );
    }

    const updatedProject = await this.databaseRepository.update(
      this.collectionName,
      id,
      updateProjectBasicInfoDto,
    );

    return this.createResponse(
      'Project successfully updated!',
      200,
      updatedProject,
    );
  }

  async updateProjectArrayField(
    id: string,
    { operation, field, value }: UpdateProjectArrayFieldDto,
  ) {
    await this.databaseRepository.updateArrayField(
      this.collectionName,
      id,
      field,
      value,
      operation,
    );
  }

  async updateProjectVisibility(
    id: string,
    app: AppNames,
  ): Promise<CustomResponse> {
    const project = await this.databaseRepository.findById(
      this.collectionName,
      id,
    );

    if (!project) throw new NotFoundException('Project not found');

    const updatedVisibility = !project.visibility?.[app];

    await this.databaseRepository.update(this.collectionName, id, {
      [`visibility.${app}`]: updatedVisibility,
    });

    return this.createResponse(`Project visibility successfully updated`, 200);
  }

  async deleteProject(id: string): Promise<CustomResponse> {
    const project = await this.databaseRepository.findById(
      this.collectionName,
      id,
    );

    await this.databaseRepository.delete(this.collectionName, id);

    await this.projectOrderService.reorderAfterDelete(project.order);

    await this.storageRepository.deleteAllFilesFromFolder(
      this.collectionName,
      project.id,
    );

    return this.createResponse(
      `Project with id "${id}" and associated files successfully deleted. Remaining projects have been reordered.`,
      200,
    );
  }
}
