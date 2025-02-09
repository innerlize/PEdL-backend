import { IsEnum, IsNumber } from 'class-validator';
import { AppNames } from '../../../../common/domain/app-names.enum';

export class UpdateProjectOrderDto {
  @IsNumber()
  currentOrder: number;

  @IsNumber()
  newOrder: number;

  @IsEnum(AppNames)
  app: AppNames;
}
