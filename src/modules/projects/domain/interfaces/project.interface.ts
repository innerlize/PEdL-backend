import { Link } from '../../../../common/domain/link.interface';
import { Media } from './media.interface';

export interface Project {
  id: string;
  name: string;
  customer: string;
  media?: Media;
  description: string;
  softwares: string[];
  start_date: Date;
  end_date: Date;
  links?: Link[];
}
