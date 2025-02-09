import { IsOptional, IsArray, IsString } from 'class-validator';

export class UpdateProjectMediaDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videos?: string[];
}
