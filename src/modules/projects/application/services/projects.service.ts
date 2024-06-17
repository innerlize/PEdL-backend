import { Injectable, Inject } from '@nestjs/common';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { Project } from '../../domain/interfaces/project.interface';
import { DatabaseRepository } from 'src/common/domain/database-repository.interface';
import { UpdateProjectDto } from '../dtos/update-project.dto';

@Injectable()
export class ProjectsService {
  private readonly collectionName = 'projects';

  constructor(
    @Inject('DatabaseRepository')
    private readonly databaseRepository: DatabaseRepository<Project>,
  ) {}

  async getAllProjects(): Promise<Project[]> {
    return this.databaseRepository.findAll(this.collectionName);
  }

  async getProject(id: string): Promise<Project> {
    return this.databaseRepository.findById(this.collectionName, id);
  }

  async createProject(createProjectDto: CreateProjectDto): Promise<string> {
    return this.databaseRepository.create(
      this.collectionName,
      createProjectDto,
    );
  }

  async updateProject(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<string> {
    return this.databaseRepository.update(
      this.collectionName,
      id,
      updateProjectDto,
    );
  }

  async deleteProject(id: string): Promise<string> {
    return this.databaseRepository.delete(this.collectionName, id);
  }
}
