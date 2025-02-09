import { VisibilityByAppDto } from '@common/application/dtos/visibility-by-app.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class FieldWithVisibilityDto<T> {
  @ValidateNested()
  value: T;

  @ValidateNested()
  @Type(() => VisibilityByAppDto)
  visibility: VisibilityByAppDto;
}
