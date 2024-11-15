import { IsEnum, IsString } from 'class-validator';
import { AppNames } from 'src/common/domain/app-names.enum';

export class UpdateProjectVisibilityParams {
  @IsString()
  id: string;

  @IsEnum(AppNames)
  app: AppNames;
}
