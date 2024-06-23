import { Type } from 'class-transformer';
import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { LinkDto } from '../../../../common/application/dtos/link.dto';

export class CreatePartnerDto {
  @IsString()
  name: string;

  @IsString()
  image: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  links?: LinkDto[];
}
