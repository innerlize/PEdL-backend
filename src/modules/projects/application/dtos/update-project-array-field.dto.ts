import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { LinkDto } from '@common/application/dtos/link.dto';
import { ArrayField } from '@modules/projects/domain/enums/array-field.enum';
import { ArrayOperation } from '@modules/projects/domain/enums/array-operation.enum';
import { IsValueValidBasedOnField } from '@modules/projects/application/validators/array-field-value.validator';

export class UpdateProjectArrayFieldDto {
  @IsNotEmpty()
  @IsValueValidBasedOnField()
  value: string | LinkDto;

  @IsNotEmpty()
  @IsEnum(ArrayField)
  @IsString()
  field: string;

  @IsNotEmpty()
  @IsEnum(ArrayOperation)
  @IsString()
  operation: ArrayOperation;
}
