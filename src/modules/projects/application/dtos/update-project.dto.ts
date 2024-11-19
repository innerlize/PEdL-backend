import {
  IsString,
  IsArray,
  IsDate,
  ValidateNested,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LinkDto } from '../../../../common/application/dtos/link.dto';
import { IsFiles, MemoryStoredFile } from 'nestjs-form-data';
import { Category } from '../../domain/interfaces/category.enum';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  customer?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  softwares?: string[];

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagesUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsFiles({ each: true })
  imagesFiles?: MemoryStoredFile[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videosUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsFiles({ each: true })
  videosFiles?: MemoryStoredFile[];

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

  @IsOptional()
  @IsEnum(Category)
  category?: Category;
}
