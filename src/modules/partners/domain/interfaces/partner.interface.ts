import { Link } from '../../../../common/domain/link.interface';
import { ApiProperty } from '@nestjs/swagger';

export class Partner {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  links?: Link[];
}
