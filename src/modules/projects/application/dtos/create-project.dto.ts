import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LinkDto } from '../../../../common/application/dtos/link.dto';
import { Category } from '../../domain/enums/category.enum';
import { TimeframeDto } from '@modules/projects/application/dtos/timeframe.dto';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  customer: string;

  @IsString()
  description: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  softwares: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => TimeframeDto)
  timeframe?: TimeframeDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  links?: LinkDto[];

  @IsEnum(Category)
  category: Category;
}
