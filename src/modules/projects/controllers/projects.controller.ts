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
import { UpdateProjectOrderDto } from '../application/dtos/update-project-order.dto';

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
  @Patch('/:id/order')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CustomResponse })
  async updateProjectOrder(
    @Param('id') id: string,
    @Body() updateProjectOrderDto: UpdateProjectOrderDto,
  ): Promise<CustomResponse> {
    return await this.projectsService.updateProjectOrder(
      id,
      updateProjectOrderDto,
    );
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CustomResponse })
  async deleteProject(@Param('id') id: string): Promise<CustomResponse> {
    return await this.projectsService.deleteProject(id);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id/file')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CustomResponse })
  async deleteFileFromProject(
    @Param('id') id: string,
    @Body() { fileUrl, fileType }: DeleteFileFromProjectDto,
  ): Promise<void> {
    return await this.projectsService.deleteFileFromProject(
      id,
      fileUrl,
      fileType,
    );
  }
}
