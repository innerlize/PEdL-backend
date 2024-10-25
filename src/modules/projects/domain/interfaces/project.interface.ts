import { Media } from './media.interface';
import { Link } from '../../../../common/domain/link.interface';
import { Timestamp } from '../../../../common/domain/timestamp.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
}
