import { Test, TestingModule } from '@nestjs/testing';
import { PartnersController } from '../partners.controller';
import { PartnersService } from '../../application/services/partners.service';
import { Partner } from '../../domain/interfaces/partner';
import { CreatePartnerDto } from '../../application/dtos/create-partner.dto';
import { UpdatePartnerDto } from '../../application/dtos/update-partner.dto';

describe('PartnersController', () => {
  let controller: PartnersController;
  let service: PartnersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartnersController],
      providers: [
        {
          provide: PartnersService,
          useValue: {
            getAllPartners: jest.fn(),
            getPartner: jest.fn(),
            createPartner: jest.fn(),
            updatePartner: jest.fn(),
            deletePartner: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PartnersController>(PartnersController);
    service = module.get<PartnersService>(PartnersService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should return an array of partners', async () => {
    const result: Partner[] = [
      {
        id: '1',
        name: 'Partner 1',
        image: 'image.png',
      },
    ];

    jest.spyOn(service, 'getAllPartners').mockResolvedValue(result);

    expect(await controller.getAllPartners()).toBe(result);
  });

  it('should return a partner by id', async () => {
    const id = '1';

    const result: Partner = {
      id: '1',
      name: 'Partner 1',
      image: 'image.png',
    };

    jest.spyOn(service, 'getPartner').mockResolvedValue(result);

    expect(await controller.getPartner(id)).toBe(result);
  });

  it('should create a new partner', async () => {
    const createPartnerDto: CreatePartnerDto = {
      name: 'Partner 1',
      image: 'image.png',
    };

    const result = {
      message: 'Partner successfully created!',
      status: 201,
      data: createPartnerDto,
    };

    jest.spyOn(service, 'createPartner').mockResolvedValue(result);

    expect(await controller.createPartner(createPartnerDto)).toBe(result);
  });

  it('should update an existing partner', async () => {
    const id = '1';

    const updatePartnerDto: UpdatePartnerDto = { name: 'Updated Partner' };

    const result = {
      message: `Partner with id "${id}" successfully updated!`,
      status: 200,
      data: updatePartnerDto,
    };

    jest.spyOn(service, 'updatePartner').mockResolvedValue(result);

    expect(await controller.updatePartner(id, updatePartnerDto)).toBe(result);
  });

  it('should delete a partner', async () => {
    const id = '1';

    const result = {
      message: `Partner with id "${id}" successfully deleted!`,
      status: 200,
    };

    jest.spyOn(service, 'deletePartner').mockResolvedValue(result);

    expect(await controller.deletePartner(id)).toBe(result);
  });
});
