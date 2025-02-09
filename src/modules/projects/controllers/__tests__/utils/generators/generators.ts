import { ProjectVisibilityByApp } from '@common/domain/project-visibility-by-app.interface';
import { faker } from '@faker-js/faker/.';
import { ProjectOrderByApp } from '@modules/projects/domain/interfaces/project-order-by-app.interface';
import { ProjectThumbnailByApp } from '@modules/projects/domain/interfaces/project-thumbnail-by-app.interface';
import { Timeframe } from '@modules/projects/domain/interfaces/timeframe.interface';
import { UniqueEnforcer } from 'enforce-unique';
import { Timestamp } from '@google-cloud/firestore';
import { Link } from '@common/domain/link.interface';
import { Media } from '@modules/projects/domain/interfaces/media.interface';

interface GeneratorParams {
  quantity: number;
}

const uniqueEnforcer = new UniqueEnforcer();

export const generateUniqueName = (): string =>
  uniqueEnforcer.enforce(() => faker.company.name());

export const generateThumbnails = (): ProjectThumbnailByApp => ({
  pedl: faker.image.url(),
  cofcof: faker.image.url(),
});

export const generateMedia = ({ quantity }: GeneratorParams): Media => {
  const media: Media = {
    images: [],
    videos: [],
  };

  for (let i = 0; i < quantity; i++) {
    media.images.push({
      url: faker.image.url(),
      visibility: generateVisibilityByApp(),
    });
    media.videos.push({
      url: faker.internet.url(),
      visibility: generateVisibilityByApp(),
    });
  }

  return media;
};

export const generateTimeframe = (): Timeframe => ({
  start_date: Timestamp.fromDate(faker.date.past()),
  end_date: Timestamp.fromDate(faker.date.recent()),
});

export const generateUniqueLinks = ({ quantity }: GeneratorParams): Link[] => {
  const links: Link[] = [];

  for (let i = 0; i < quantity; i++) {
    const uniqueLink = uniqueEnforcer.enforce(() => ({
      label: faker.commerce.productName(),
      url: faker.internet.url(),
    }));

    links.push(uniqueLink);
  }

  return links;
};

export const generateUniqueOrder = (): ProjectOrderByApp => {
  const PEDL_ORDER_RANGE = { min: 1, max: 10 };
  const COFCOF_ORDER_RANGE = { min: 11, max: 20 };

  return uniqueEnforcer.enforce(() => ({
    pedl: faker.number.int(PEDL_ORDER_RANGE),
    cofcof: faker.number.int(COFCOF_ORDER_RANGE),
  }));
};

export const generateVisibilityByApp = (): {
  pedl: boolean;
  cofcof: boolean;
} => ({
  pedl: faker.datatype.boolean(),
  cofcof: faker.datatype.boolean(),
});

export const generateProjectVisibility = (): ProjectVisibilityByApp => {
  const setFieldsVisibility = () => ({
    customer: faker.datatype.boolean(),
    description: faker.datatype.boolean(),
    softwares: faker.datatype.boolean(),
    timeframe: faker.datatype.boolean(),
    links: faker.datatype.boolean(),
  });

  return {
    pedl: {
      is_visible: faker.datatype.boolean(),
      fields: setFieldsVisibility(),
    },
    cofcof: {
      is_visible: faker.datatype.boolean(),
      fields: setFieldsVisibility(),
    },
  };
};
