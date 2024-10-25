import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { AppNames } from '../../../../common/domain/app-names.enum';

export class UpdateProjectOrderDto {
  @IsNotEmpty()
  @IsNumber()
  newOrder: number;

  @IsNotEmpty()
  @IsEnum(AppNames)
  app: AppNames;
}
