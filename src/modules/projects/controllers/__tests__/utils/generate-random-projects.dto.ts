import { AppNames } from '@common/domain/app-names.enum';
import { faker } from '@faker-js/faker/.';
import { CreateProjectDto } from '@modules/projects/application/dtos/create-project.dto';
import { UpdateProjectArrayFieldDto } from '@modules/projects/application/dtos/update-project-array-field.dto';
import { UpdateProjectBasicInfoDto } from '@modules/projects/application/dtos/update-project-info.dto';
import { UpdateProjectMediaDto } from '@modules/projects/application/dtos/update-project-media.dto';
import { UpdateProjectOrderDto } from '@modules/projects/application/dtos/update-project-order.dto';
import { UpdateProjectThumbnailsDto } from '@modules/projects/application/dtos/update-project-thumbnails.dto';
import { UpdateProjectVisibilityParams } from '@modules/projects/application/dtos/update-project-visibility.params';
import { generateUniqueName } from '@modules/projects/controllers/__tests__/utils/generators/generators';
import {
  generateTimeframeDto,
  generateUniqueLinksDtos,
} from '@modules/projects/controllers/__tests__/utils/generators/generators.dto';
import { ArrayField } from '@modules/projects/domain/enums/array-field.enum';
import { ArrayOperation } from '@modules/projects/domain/enums/array-operation.enum';
import { Category } from '@modules/projects/domain/enums/category.enum';

interface GenerateRandomProjectDtosParams {
  quantity: number;
  metadata?: Record<string, unknown>;
}

export const generateRandomCreateProjectDtos = ({
  quantity,
}: GenerateRandomProjectDtosParams): CreateProjectDto[] => {
  const projectDtos: CreateProjectDto[] = [];

  for (let i = 0; i < quantity; i++) {
    projectDtos.push({
      name: generateUniqueName(),
      customer: faker.company.name(),
      description: faker.lorem.paragraph(),
      softwares: faker.helpers.uniqueArray(faker.word.sample, 3),
      timeframe: generateTimeframeDto(),
      category: faker.helpers.enumValue(Category),
    });
  }

  return projectDtos;
};

export const generateRandomUpdateProjectBasicInfoDtos = ({
  quantity,
}: GenerateRandomProjectDtosParams): UpdateProjectBasicInfoDto[] => {
  const projectDtos: UpdateProjectBasicInfoDto[] = [];

  for (let i = 0; i < quantity; i++) {
    const rawDto = {
      name: faker.helpers.maybe(() => generateUniqueName()),
      customer: faker.helpers.maybe(() => faker.company.name()),
      description: faker.helpers.maybe(() => faker.lorem.paragraph()),
      timeframe: faker.helpers.maybe(() => generateTimeframeDto()),
      category: faker.helpers.maybe(() => faker.helpers.enumValue(Category)),
    };

    const filteredDto = Object.fromEntries(
      Object.entries(rawDto).filter(([_, value]) => value !== undefined),
    );

    projectDtos.push(filteredDto as UpdateProjectBasicInfoDto);
  }

  return projectDtos;
};

export const generateRandomUpdateProjectArrayFieldDtos = ({
  quantity,
}: GenerateRandomProjectDtosParams): UpdateProjectArrayFieldDto[] => {
  const projectDtos: UpdateProjectArrayFieldDto[] = [];

  for (let i = 0; i < quantity; i++) {
    const field = faker.helpers.enumValue(ArrayField);
    const value =
      field === 'softwares'
        ? faker.word.sample()
        : generateUniqueLinksDtos({ quantity: 1 })[0];

    projectDtos.push({
      value,
      field,
      operation: faker.helpers.enumValue(ArrayOperation),
    });
  }

  return projectDtos;
};

export const generateRandomUpdateProjectThumbnailsDtos = ({
  quantity,
}: GenerateRandomProjectDtosParams): UpdateProjectThumbnailsDto[] => {
  const projectDtos: UpdateProjectThumbnailsDto[] = [];

  for (let i = 0; i < quantity; i++) {
    projectDtos.push({
      pedl: faker.image.url(),
      cofcof: faker.helpers.maybe(() => faker.image.url()),
    });
  }

  return projectDtos;
};

export const generateRandomUpdateProjectMediaDtos = ({
  quantity,
}: GenerateRandomProjectDtosParams): UpdateProjectMediaDto[] => {
  const projectDtos: UpdateProjectMediaDto[] = [];

  for (let i = 0; i < quantity; i++) {
    projectDtos.push({
      images: faker.helpers.uniqueArray(faker.image.url, 2),
      videos: faker.helpers.uniqueArray(faker.internet.url, 2),
    });
  }

  return projectDtos;
};

export const generateRandomUpdateProjectOrderDtos = ({
  quantity,
}: GenerateRandomProjectDtosParams): UpdateProjectOrderDto[] => {
  const CURRENT_ORDER_RANGE = { min: 1, max: 10 };
  const NEW_ORDER_RANGE = { min: 11, max: 20 };

  const projectDtos: UpdateProjectOrderDto[] = [];

  for (let i = 0; i < quantity; i++) {
    projectDtos.push({
      currentOrder: faker.number.int(CURRENT_ORDER_RANGE),
      newOrder: faker.number.int(NEW_ORDER_RANGE),
      app: faker.helpers.enumValue(AppNames),
    });
  }

  return projectDtos;
};

export const generateRandomUpdateProjectVisibilityDtos = ({
  quantity,
  metadata,
}: GenerateRandomProjectDtosParams): UpdateProjectVisibilityParams[] => {
  const projectsDtos: UpdateProjectVisibilityParams[] = [];

  for (let i = 0; i < quantity; i++) {
    projectsDtos.push({
      id: metadata.id as string,
      app: faker.helpers.enumValue(AppNames),
    });
  }

  return projectsDtos;
};
