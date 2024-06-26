import { Injectable, Inject } from '@nestjs/common';
import { DatabaseRepository } from 'src/common/domain/database-repository.interface';
import { CustomResponse } from 'src/common/domain/custom-response';
import { Partner } from '../../domain/interfaces/partner';
import { CreatePartnerDto } from '../dtos/create-partner.dto';
import { UpdatePartnerDto } from '../dtos/update-partner.dto';

@Injectable()
export class PartnersService {
  private readonly collectionName = 'partners';

  constructor(
    @Inject('DatabaseRepository')
    private readonly databaseRepository: DatabaseRepository<Partner>,
  ) {}

  async getAllPartners(): Promise<Partner[]> {
    return await this.databaseRepository.findAll(this.collectionName);
  }

  async getPartner(id: string): Promise<Partner> {
    return await this.databaseRepository.findById(this.collectionName, id);
  }

  async createPartner(
    createPartnerDto: CreatePartnerDto,
  ): Promise<CustomResponse> {
    const createdPartner = await this.databaseRepository.create(
      this.collectionName,
      createPartnerDto,
    );

    const response: CustomResponse = {
      message: 'Partner successfully created!',
      status: 200,
      data: createdPartner,
    };

    return response;
  }

  async updatePartner(
    id: string,
    updatePartnerDto: UpdatePartnerDto,
  ): Promise<CustomResponse> {
    const updatedProject = await this.databaseRepository.update(
      this.collectionName,
      id,
      updatePartnerDto,
    );

    const response: CustomResponse = {
      message: `Partner with id "${id}" successfully updated!`,
      status: 200,
      data: updatedProject,
    };

    return response;
  }

  async deletePartner(id: string): Promise<CustomResponse> {
    await this.databaseRepository.delete(this.collectionName, id);

    const response: CustomResponse = {
      message: `Partner with id "${id}" successfully deleted!`,
      status: 200,
    };

    return response;
  }
}
