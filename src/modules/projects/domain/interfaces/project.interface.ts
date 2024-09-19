import { Link } from '../../../../common/domain/link.interface';
import { Media } from './media.interface';

export interface Project {
  id: string;
  name: string;
  customer: string;
  description: string;
  softwares: string[];
  thumbnail: string;
  media?: Media;
  start_date: Date;
  end_date: Date;
  links?: Link[];
}
