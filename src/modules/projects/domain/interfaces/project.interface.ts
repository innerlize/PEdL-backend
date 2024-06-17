import { Link } from './link.interface';
import { Media } from './media.interface';

export interface Project {
  name: string;
  customer: string;
  media?: Media;
  description: string;
  softwares: string[];
  start_date: Date;
  end_date: Date;
  links?: Link[];
}
