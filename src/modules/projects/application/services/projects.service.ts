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
    const newProject = await this.projectOrderService.assignInitialOrder(
      this.collectionName,
      createProjectDto,
    );

    const createdProject = await this.databaseRepository.create(
      this.collectionName,
      newProject,
    );
    return this.createResponse(
      'Project successfully created!',
      201,
      createdProject,
    );
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
}
