import { LinkDto } from '@common/application/dtos/link.dto';
import { faker } from '@faker-js/faker/.';
import { TimeframeDto } from '@modules/projects/application/dtos/timeframe.dto';
import { UniqueEnforcer } from 'enforce-unique';

interface GeneratorDtoParams {
  quantity: number;
  metadata?: Record<string, unknown>;
}

const uniqueEnforcer = new UniqueEnforcer();

export const generateTimeframeDto = (): TimeframeDto => ({
  start_date: faker.date.past(),
  end_date: faker.date.recent(),
});

export const generateUniqueLinksDtos = ({
  quantity,
}: GeneratorDtoParams): LinkDto[] => {
  const links: LinkDto[] = [];

  for (let i = 0; i < quantity; i++) {
    const uniqueLink = uniqueEnforcer.enforce(() => ({
      label: faker.commerce.productName(),
      url: faker.internet.url(),
    }));

    links.push(uniqueLink);
  }

  return links;
};

export const generateFiles = ({
  quantity,
  metadata,
}: GeneratorDtoParams): Express.Multer.File[] => {
  const files: Express.Multer.File[] = [];

  for (let i = 0; i < quantity; i++) {
    files.push({
      fieldname: metadata.fieldName as string,
      originalname: faker.system.commonFileName(
        faker.helpers.arrayElement(['png', 'jpeg']),
      ),
      mimetype: faker.helpers.arrayElement(['image/png', 'image/jpeg']),
      buffer: Buffer.from('fake file content'),
      size: faker.number.int({ min: 1000, max: 5000 }),
    } as Express.Multer.File);
  }

  return files;
};
