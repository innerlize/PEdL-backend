import { Test, TestingModule } from '@nestjs/testing';
import { PartnersService } from '../partners.service';
import { Partner } from 'src/modules/partners/domain/interfaces/partner';
import * as request from 'supertest';
import { PartnersController } from '../../../controllers/partners.controller';
import { CreatePartnerDto } from '../../dtos/create-partner.dto';
import { UpdatePartnerDto } from '../../dtos/update-partner.dto';

describe('PartnersService', () => {
  let partnersService: PartnersService;
  let app: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnersService,
        {
          provide: 'DatabaseRepository',
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
      controllers: [PartnersController],
    }).compile();

    partnersService = module.get<PartnersService>(PartnersService);
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(partnersService).toBeDefined();
  });

  it('should get all partners', async () => {
    const partners: Partner[] = [
      {
        id: '1',
        name: 'Partner 1',
        image: 'xample.com',
        links: [
          { label: 'Link 1', url: 'example.com' },
          { label: 'Link 2', url: 'example.com' },
        ],
      },
      {
        id: '2',
        name: 'Partner 2',
        image: 'xample.com',
        links: [
          { label: 'Link 1', url: 'example.com' },
          { label: 'Link 2', url: 'example.com' },
        ],
      },
    ];

    jest.spyOn(partnersService, 'getAllPartners').mockResolvedValue(partners);

    const response = await request(app.getHttpServer()).get('/api/partners');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          image: expect.any(String),
          links: expect.any(Array),
        }),
      ]),
    );
  });

  it('should return a partner by ID', async () => {
    const partnerId = '1';
    const partner: Partner = {
      id: '1',
      name: 'Partner 1',
      image: 'xample.com',
      links: [
        { label: 'Link 1', url: 'example.com' },
        { label: 'Link 2', url: 'example.com' },
      ],
    };

    jest.spyOn(partnersService, 'getPartner').mockResolvedValue(partner);

    const response = await request(app.getHttpServer()).get(
      `/api/partners/${partnerId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        image: expect.any(String),
        links: expect.any(Array),
      }),
    );
  });

  it('should create a new partner', async () => {
    const partnerId = '1';
    const createPartnerDto: CreatePartnerDto = {
      name: 'Partner 1',
      image: 'xample.com',
      links: [
        { label: 'Link 1', url: 'example.com' },
        { label: 'Link 2', url: 'example.com' },
      ],
    };

    const resultMock = {
      message: 'Partner successfully created!',
      status: 201,
      data: { id: partnerId, ...createPartnerDto },
    };

    jest.spyOn(partnersService, 'createPartner').mockResolvedValue(resultMock);

    const response = await request(app.getHttpServer())
      .post('/api/partners')
      .send(createPartnerDto);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
        status: expect.any(Number),
        data: expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          image: expect.any(String),
          links: expect.any(Array),
        }),
      }),
    );
  });

  it('should update an existing partner', async () => {
    const createPartnerDto: CreatePartnerDto = {
      name: 'Partner 1',
      image: 'xample.com',
      links: [
        { label: 'Link 1', url: 'example.com' },
        { label: 'Link 2', url: 'example.com' },
      ],
    };

    const updatePartnerDto: UpdatePartnerDto = { name: 'Partner 1 Updated' };

    const createResponse = await request(app.getHttpServer())
      .post('/api/partners')
      .send(createPartnerDto);

    const partnerId = createResponse.body.data.id;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, ...createPartnerDtoWithoutName } = createPartnerDto;

    const resultMock = {
      message: 'Partner successfully updated!',
      status: 201,
      data: {
        id: partnerId,
        name: updatePartnerDto.name,
        ...createPartnerDtoWithoutName,
      },
    };

    jest.spyOn(partnersService, 'updatePartner').mockResolvedValue(resultMock);

    const response = await request(app.getHttpServer())
      .patch(`/api/partners/${partnerId}`)
      .send(updatePartnerDto);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
        status: expect.any(Number),
        data: expect.objectContaining({
          id: expect.any(String),
          name: updatePartnerDto.name,
          image: expect.any(String),
          links: expect.any(Array),
        }),
      }),
    );
  });

  it('should delete an existing partner', async () => {
    const createPartnerDto: CreatePartnerDto = {
      name: 'Partner 1',
      image: 'xample.com',
      links: [
        { label: 'Link 1', url: 'example.com' },
        { label: 'Link 2', url: 'example.com' },
      ],
    };

    const createResponse = await request(app.getHttpServer())
      .post('/api/partners')
      .send(createPartnerDto);

    const partnerId = createResponse.body.data.id;

    const resultMock = {
      message: `Partner with ID "${partnerId}" successfully updated!`,
      status: 200,
    };

    jest.spyOn(partnersService, 'deletePartner').mockResolvedValue(resultMock);

    const deleteResponse = await request(app.getHttpServer()).delete(
      `/api/partners/${partnerId}`,
    );

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
        status: expect.any(Number),
      }),
    );
    expect(deleteResponse.body).not.toHaveProperty('data', expect.any(Object));
  });
});
