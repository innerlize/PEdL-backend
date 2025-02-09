import { IsBoolean } from 'class-validator';

export class VisibilityByAppDto {
  @IsBoolean()
  pedl: boolean;

  @IsBoolean()
  cofcof: boolean;
}
