import { IsString } from 'class-validator';

export class DeleteFileFromProjectDto {
  @IsString()
  fileUrl: string;

  @IsString()
  fileType: 'image' | 'video';
}
