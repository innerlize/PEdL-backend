import { Timestamp } from '@common/domain/timestamp.interface';

export interface Timeframe {
  start_date: Timestamp;
  end_date: Timestamp;
}
