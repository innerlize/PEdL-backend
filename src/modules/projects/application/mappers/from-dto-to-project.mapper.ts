import { Project } from '../../domain/interfaces/project.interface';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { UpdateProjectDto } from '../dtos/update-project.dto';

interface MappedProject
  extends Omit<
    Project,
    'id' | 'start_date' | 'end_date' | 'order' | 'visibility'
  > {
  start_date: Date;
  end_date: Date;
}

export function mapCreateProjectDtoToProject(
  dto: CreateProjectDto,
): MappedProject {
  const project: MappedProject = {
    name: dto.name,
    customer: dto.customer,
    description: dto.description,
    thumbnail: dto.thumbnail,
    softwares: dto.softwares || [],
    media: {
      images: dto.imagesUrls || [],
      videos: dto.videosUrls || [],
    },
    start_date: dto.start_date,
    end_date: dto.end_date,
    links: dto.links || [],
  };

  return project;
}

export function mapUpdateProjectDtoToProject(
  dto: UpdateProjectDto,
): Partial<
  Omit<Project, 'id' | 'start_date' | 'end_date' | 'order' | 'visibility'>
> {
  const project: Partial<
    Omit<Project, 'id' | 'start_date' | 'end_date' | 'order' | 'visibility'>
  > = {};

  if (dto.name) project.name = dto.name;
  if (dto.customer) project.customer = dto.customer;
  if (dto.description) project.description = dto.description;
  if (dto.thumbnail) project.thumbnail = dto.thumbnail;
  if (dto.softwares) project.softwares = dto.softwares;
  if (dto.links) project.links = dto.links;

  return project;
}
