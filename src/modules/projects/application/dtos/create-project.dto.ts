import {
  IsString,
  IsArray,
  IsDate,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MediaDto } from './media.dto';
import { LinkDto } from './link.dto';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  customer: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MediaDto)
  media?: MediaDto;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  softwares: string[];

  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @IsDate()
  @Type(() => Date)
  end_date: Date;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  links?: LinkDto[];
}
