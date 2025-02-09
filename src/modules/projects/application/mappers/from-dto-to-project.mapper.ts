import { Project } from '../../domain/interfaces/project.interface';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { ProjectOrderByApp } from '@modules/projects/domain/interfaces/project-order-by-app.interface';
import { AppNames } from '@common/domain/app-names.enum';
import { ProjectVisibilityByApp } from '@common/domain/project-visibility-by-app.interface';

export interface MappedProject
  extends Omit<
    Project,
    'id' | 'thumbnail' | 'media' | 'created_at' | 'updated_at' | 'timeframe'
  > {
  timeframe?: {
    start_date: Date;
    end_date: Date;
  };
}

export const fromCreateProjectDtoToProject = (
  dto: CreateProjectDto,
  initialOrder: ProjectOrderByApp,
): MappedProject => {
  const project: MappedProject = {
    name: dto.name,
    customer: dto.customer,
    description: dto.description,
    softwares: dto.softwares,
    timeframe: dto.timeframe,
    links: dto.links,
    category: dto.category,
    order: initialOrder,
    visibility: setDefaultProjectVisibility(),
  };

  return project;
};

const setDefaultProjectVisibility = (): ProjectVisibilityByApp => ({
  [AppNames.PEDL]: {
    is_visible: false,
    fields: {
      customer: false,
      description: false,
      softwares: false,
      timeframe: false,
      links: false,
    },
  },
  [AppNames.COFCOF]: {
    is_visible: false,
    fields: {
      customer: false,
      description: false,
      softwares: false,
      timeframe: false,
      links: false,
    },
  },
});
