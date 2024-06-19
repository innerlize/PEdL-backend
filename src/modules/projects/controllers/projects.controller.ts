import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { ProjectsService } from '../application/services/projects.service';
import { CreateProjectDto } from '../application/dtos/create-project.dto';
import { Project } from '../domain/interfaces/project.interface';
import { UpdateProjectDto } from '../application/dtos/update-project.dto';
import { CustomResponse } from 'src/common/domain/custom-response';

@Controller('api/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('/')
  async getAllProjects(): Promise<Project[]> {
    return await this.projectsService.getAllProjects();
  }

  @Get('/:id')
  async getProject(@Param('id') id: string): Promise<Project> {
    return await this.projectsService.getProject(id);
  }

  @Post('/')
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<{ message: string }> {
    return await this.projectsService.createProject(createProjectDto);
  }

  @Patch('/:id')
  async updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<CustomResponse> {
    return await this.projectsService.updateProject(id, updateProjectDto);
  }

  @Delete('/:id')
  async deleteProject(@Param('id') id: string): Promise<CustomResponse> {
    return await this.projectsService.deleteProject(id);
  }
}
