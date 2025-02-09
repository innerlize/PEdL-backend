import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ProjectsService } from '../application/services/projects.service';
import { CreateProjectDto } from '../application/dtos/create-project.dto';
import { Project } from '../domain/interfaces/project.interface';
import { CustomResponse } from '../../../common/domain/custom-response.interface';
import { AuthGuard } from '../../../common/application/guards/auth.guard';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateProjectVisibilityParams } from '../application/dtos/update-project-visibility.params';
import { UpdateProjectBasicInfoDto } from '@modules/projects/application/dtos/update-project-info.dto';
import { UpdateProjectArrayFieldDto } from '@modules/projects/application/dtos/update-project-array-field.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ProjectsMediaService } from '@modules/projects/application/services/projects-media.service';
import { UpdateProjectThumbnailsDto } from '@modules/projects/application/dtos/update-project-thumbnails.dto';
import { AppNames } from '@common/domain/app-names.enum';
import { UpdateProjectMediaDto } from '@modules/projects/application/dtos/update-project-media.dto';
import { ProjectsOrderService } from '@modules/projects/application/services/projects-order.service';
import { UpdateProjectOrderDto } from '@modules/projects/application/dtos/update-project-order.dto';
import { DeleteFileFromProjectParams } from '@modules/projects/application/dtos/delete-file-from-project.params';

@ApiTags('Projects')
@Controller('api/projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectOrderService: ProjectsOrderService,
    private readonly projectsMediaService: ProjectsMediaService,
  ) {}

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

  @Patch('/:id/basic-info')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CustomResponse })
  async updateProjectBasicInfo(
    @Param('id') id: string,
    @Body() updateProjectBasicInfoDto: UpdateProjectBasicInfoDto,
  ): Promise<CustomResponse> {
    return await this.projectsService.updateProjectBasicInfo(
      id,
      updateProjectBasicInfoDto,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('/:id/array-field')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CustomResponse })
  async updateProjectArrayField(
    @Param('id') id: string,
    @Body() { value, field, operation }: UpdateProjectArrayFieldDto,
  ) {
    return await this.projectsService.updateProjectArrayField(id, {
      value,
      field,
      operation,
    });
  }

  @UseGuards(AuthGuard)
  @Patch('/:id/thumbnails')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CustomResponse })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'pedl', maxCount: 1 },
      { name: 'cofcof', maxCount: 1 },
    ]),
  )
  async updateProjectThumbnails(
    @Param('id') projectId: string,
    @Body() thumbnailsUrls: UpdateProjectThumbnailsDto,
    @UploadedFiles()
    uploadedFiles: {
      pedl?: Express.Multer.File[];
      cofcof?: Express.Multer.File[];
    },
  ): Promise<void> {
    const thumbnailsFiles: Partial<Record<AppNames, Express.Multer.File>> = {
      [AppNames.PEDL]: uploadedFiles.pedl?.[0],
      [AppNames.COFCOF]: uploadedFiles.cofcof?.[0],
    };

    await this.projectsMediaService.updateThumbnails(
      projectId,
      thumbnailsUrls,
      thumbnailsFiles,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('/:id/media')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CustomResponse })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 10 },
      { name: 'videos', maxCount: 10 },
    ]),
  )
  async updateProjectMedia(
    @Param('id') projectId: string,
    @Body() mediaUrls: UpdateProjectMediaDto,
    @UploadedFiles()
    uploadedFiles: {
      images?: Express.Multer.File[];
      videos?: Express.Multer.File[];
    },
  ): Promise<void> {
    const mediaFiles: Partial<
      Record<'images' | 'videos', Express.Multer.File[]>
    > = {
      images: uploadedFiles.images || [],
      videos: uploadedFiles.videos || [],
    };

    await this.projectsMediaService.updateMedia(
      projectId,
      mediaUrls,
      mediaFiles,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('/:id/order')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CustomResponse })
  async updateProjectOrder(
    @Param('id') projectId: string,
    @Body() { currentOrder, newOrder, app }: UpdateProjectOrderDto,
  ): Promise<void> {
    return await this.projectOrderService.updateOrder(
      projectId,
      currentOrder,
      newOrder,
      app,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('/:id/visibility/:app')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CustomResponse })
  async updateProjectVisibility(
    @Param() { id, app }: UpdateProjectVisibilityParams,
  ): Promise<CustomResponse> {
    return await this.projectsService.updateProjectVisibility(id, app);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CustomResponse })
  async deleteProject(@Param('id') id: string): Promise<CustomResponse> {
    return await this.projectsService.deleteProject(id);
  }

  @UseGuards(AuthGuard)
  @Delete('/:projectId/:fileType/:fileId')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CustomResponse })
  async deleteFileFromProject(
    @Param()
    { projectId, fileId, fileType }: DeleteFileFromProjectParams,
  ): Promise<void> {
    return await this.projectsMediaService.deleteFileFromProject({
      projectId,
      fileId,
      fileType,
    });
  }
}
