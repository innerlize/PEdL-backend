import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomResponse {
  @ApiProperty()
  status: number;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional()
  data?: any;
}
