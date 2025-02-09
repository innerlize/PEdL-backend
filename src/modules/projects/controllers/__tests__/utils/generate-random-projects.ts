import { faker } from '@faker-js/faker/.';
import {
  generateUniqueName,
  generateThumbnails,
  generateTimeframe,
  generateProjectVisibility,
  generateUniqueOrder,
  generateUniqueLinks,
  generateMedia,
} from '@modules/projects/controllers/__tests__/utils/generators/generators';
import { Category } from '@modules/projects/domain/enums/category.enum';
import { Project } from '@modules/projects/domain/interfaces/project.interface';
import { Timestamp } from '@google-cloud/firestore';

interface GenerateRandomProjectsParams {
  quantity: number;
}

export const generateRandomProjects = ({
  quantity,
}: GenerateRandomProjectsParams): Project[] => {
  const projects: Project[] = [];

  for (let i = 0; i < quantity; i++) {
    projects.push({
      id: faker.string.uuid(),
      name: generateUniqueName(),
      customer: faker.company.name(),
      description: faker.lorem.paragraph(),
      softwares: faker.helpers.uniqueArray(faker.word.sample, 3),
      thumbnails: generateThumbnails(),
      media: generateMedia({ quantity: 3 }),
      timeframe: generateTimeframe(),
      links: generateUniqueLinks({ quantity: 3 }),
      visibility: generateProjectVisibility(),
      order: generateUniqueOrder(),
      category: faker.helpers.enumValue(Category),
      created_at: Timestamp.fromDate(faker.date.past()),
      updated_at: Timestamp.fromDate(faker.date.recent()),
    });
  }

  return projects;
};
