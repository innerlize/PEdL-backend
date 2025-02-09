import { Media } from '../interfaces/media.interface';
import { Link } from '../../../../common/domain/link.interface';
import { ProjectOrderByApp } from '../interfaces/project-order-by-app.interface';
import { Category } from '../enums/category.enum';
import { Timeframe } from '@modules/projects/domain/interfaces/timeframe.interface';
import { ProjectThumbnailByApp } from '@modules/projects/domain/interfaces/project-thumbnail-by-app.interface';
import { BaseModel } from '@common/domain/base-model.interface';
import { ProjectVisibilityByApp } from '@common/domain/project-visibility-by-app.interface';

export class ProjectEntity extends BaseModel {
  name: string;
  customer: string;
  description: string;
  softwares: string[];
  thumbnails?: ProjectThumbnailByApp;
  media?: Media;
  timeframe?: Timeframe;
  links?: Link[];
  category: Category;
  order: ProjectOrderByApp;
  visibility: ProjectVisibilityByApp;
}
