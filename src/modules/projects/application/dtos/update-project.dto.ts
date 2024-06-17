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

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  customer?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MediaDto)
  media?: MediaDto;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  softwares?: string[];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  start_date?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  end_date?: Date;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  links?: LinkDto[];
}
