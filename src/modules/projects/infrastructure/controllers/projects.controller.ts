import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { ProjectsService } from '../services/projects.service';
import { CreateProjectDto } from '../../application/dtos/create-project.dto';
import { Project } from '../../domain/interfaces/project.interface';
import { UpdateProjectDto } from '../../application/dtos/update-project.dto';

@Controller('api/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('/')
  async getAllProjects(): Promise<Project[]> {
    return this.projectsService.getAllProjects();
  }

  @Get('/:id')
  async getProject(@Param('id') id: string): Promise<Project> {
    return this.projectsService.getProject(id);
  }

  @Post('/')
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<string> {
    return this.projectsService.createProject(createProjectDto);
  }

  @Patch('/:id')
  async updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<string> {
    return this.projectsService.updateProject(id, updateProjectDto);
  }

  @Delete('/:id')
  async deleteProject(@Param('id') id: string): Promise<string> {
    return this.projectsService.deleteProject(id);
  }
}
