import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from '../application/services/projects.service';
import { CreateProjectDto } from '../application/dtos/create-project.dto';
import { Project } from '../domain/interfaces/project.interface';
import { UpdateProjectDto } from '../application/dtos/update-project.dto';
import { CustomResponse } from '../../../common/domain/custom-response.interface';
import { AuthGuard } from '../../../common/application/guards/auth.guard';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Projects')
@Controller('api/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('/')
  @ApiOkResponse({ type: Project, isArray: true })
  async getAllProjects(): Promise<Project[]> {
    return await this.projectsService.getAllProjects();
  }

  @Get('/:id')
  @ApiOkResponse({ type: Project })
  async getProject(@Param('id') id: string): Promise<Project> {
    return await this.projectsService.getProject(id);
  }

  @UseGuards(AuthGuard)
  @Post('/')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CustomResponse })
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<CustomResponse> {
    return await this.projectsService.createProject(createProjectDto);
  }

  @UseGuards(AuthGuard)
  @Patch('/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CustomResponse })
  async updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<CustomResponse> {
    return await this.projectsService.updateProject(id, updateProjectDto);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CustomResponse })
  async deleteProject(@Param('id') id: string): Promise<CustomResponse> {
    return await this.projectsService.deleteProject(id);
  }
}
