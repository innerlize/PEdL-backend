import { Media } from '../interfaces/media.interface';
import { Link } from '../../../../common/domain/link.interface';
import { Timestamp } from '../../../../common/domain/timestamp.interface';
import { ProjectOrderByApp } from '../interfaces/project-order-by-app.interface';
import { ProjectVisibilityByApp } from '../interfaces/project-visibility-by-app.interface';
import { Category } from '../interfaces/category.enum';

export class ProjectEntity {
  id: string;
  name: string;
  customer: string;
  description: string;
  softwares: string[];
  thumbnail: string;
  media?: Media;
  start_date: Timestamp;
  end_date: Timestamp;
  links?: Link[];
  order: ProjectOrderByApp;
  visibility: ProjectVisibilityByApp;
  category: Category;
}
