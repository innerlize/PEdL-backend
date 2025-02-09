import { Media } from './media.interface';
import { Link } from '../../../../common/domain/link.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectOrderByApp } from './project-order-by-app.interface';
import { Category } from '../enums/category.enum';
import { ProjectThumbnailByApp } from '@modules/projects/domain/interfaces/project-thumbnail-by-app.interface';
import { Timeframe } from '@modules/projects/domain/interfaces/timeframe.interface';
import { BaseModel } from '@common/domain/base-model.interface';
import { ProjectVisibilityByApp } from '@common/domain/project-visibility-by-app.interface';

export class Project extends BaseModel {
  @ApiProperty()
  name: string;

  @ApiProperty()
  customer: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  softwares: string[];

  @ApiPropertyOptional()
  thumbnails?: ProjectThumbnailByApp;

  @ApiPropertyOptional()
  media?: Media;

  @ApiPropertyOptional()
  timeframe?: Timeframe;

  @ApiPropertyOptional()
  links?: Link[];

  @ApiProperty()
  category: Category;

  @ApiProperty()
  order: ProjectOrderByApp;

  @ApiProperty()
  visibility: ProjectVisibilityByApp;
}
