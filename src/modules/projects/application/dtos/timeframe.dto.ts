import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class TimeframeDto {
  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @IsDate()
  @Type(() => Date)
  end_date: Date;
}
