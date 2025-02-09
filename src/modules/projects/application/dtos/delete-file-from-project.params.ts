import { IsString, IsIn } from 'class-validator';

export class DeleteFileFromProjectParams {
  @IsString()
  projectId: string;

  @IsString()
  fileId: string;

  @IsString()
  @IsIn(['image', 'video'])
  fileType: 'image' | 'video';
}
