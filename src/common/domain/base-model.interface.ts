import { Timestamp } from '@common/domain/timestamp.interface';
import { ApiProperty } from '@nestjs/swagger';

export class BaseModel {
  @ApiProperty()
  id: string;

  @ApiProperty()
  created_at: Timestamp;

  @ApiProperty()
  updated_at: Timestamp;
}
