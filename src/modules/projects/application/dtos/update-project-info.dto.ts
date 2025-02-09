import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from '@modules/projects/application/dtos/create-project.dto';

export class UpdateProjectBasicInfoDto extends PartialType(
  OmitType(CreateProjectDto, ['softwares', 'links'] as const),
) {}
