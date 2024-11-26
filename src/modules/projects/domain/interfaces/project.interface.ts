import { Media } from './media.interface';
import { Link } from '../../../../common/domain/link.interface';
import { Timestamp } from '../../../../common/domain/timestamp.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectOrderByApp } from './project-order-by-app.interface';
import { ProjectVisibilityByApp } from './project-visibility-by-app.interface';

export class Project {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  customer: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  softwares: string[];

  @ApiProperty()
  thumbnail: string;

  @ApiPropertyOptional()
  media?: Media;

  @ApiProperty()
  start_date: Timestamp;

  @ApiProperty()
  end_date: Timestamp;

  @ApiPropertyOptional()
  links?: Link[];

  @ApiProperty()
  order: ProjectOrderByApp;

  @ApiProperty()
  visibility: ProjectVisibilityByApp;
}
