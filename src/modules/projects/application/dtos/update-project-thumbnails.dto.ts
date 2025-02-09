import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProjectThumbnailsDto {
  @IsOptional()
  @IsString()
  @IsUrl()
  pedl?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  cofcof?: string;
}
