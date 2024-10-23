import { Injectable, Inject } from '@nestjs/common';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { DatabaseRepository } from 'src/common/domain/database-repository.interface';
import { UpdateProjectDto } from '../dtos/update-project.dto';
import { CustomResponse } from '../../../../common/domain/custom-response.interface';
import { ProjectEntity as Project } from '../../domain/entities/project.entity';

@Injectable()
export class ProjectsService {
  private readonly collectionName = 'projects';

  constructor(
    @Inject('DatabaseRepository')
    private readonly databaseRepository: DatabaseRepository<Project>,
  ) {}

  async getAllProjects(): Promise<Project[]> {
    return await this.databaseRepository.findAll(this.collectionName);
  }

  async getProject(id: string): Promise<Project> {
    return await this.databaseRepository.findById(this.collectionName, id);
  }

  async createProject(
    createProjectDto: CreateProjectDto,
  ): Promise<CustomResponse> {
    const createdProject = await this.databaseRepository.create(
      this.collectionName,
      createProjectDto,
    );

    const response: CustomResponse = {
      message: 'Project successfully created!',
      status: 200,
      data: createdProject,
    };

    return response;
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

    const response: CustomResponse = {
      message: `Project with id "${id}" successfully updated!`,
      status: 200,
      data: updatedProject,
    };

    return response;
  }

  async deleteProject(id: string): Promise<CustomResponse> {
    await this.databaseRepository.delete(this.collectionName, id);

    const response: CustomResponse = {
      message: `Project with id "${id}" successfully deleted!`,
      status: 200,
    };

    return response;
  }
}
