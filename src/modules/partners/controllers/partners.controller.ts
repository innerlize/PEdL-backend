import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CustomResponse } from 'src/common/domain/custom-response';
import { PartnersService } from '../application/services/partners.service';
import { Partner } from '../domain/interfaces/partner';
import { CreatePartnerDto } from '../application/dtos/create-partner.dto';
import { UpdatePartnerDto } from '../application/dtos/update-partner.dto';
import { AuthGuard } from '../../../common/application/guards/auth.guard';

@Controller('api/partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get('/')
  async getAllPartners(): Promise<Partner[]> {
    return await this.partnersService.getAllPartners();
  }

  @Get('/:id')
  async getPartner(@Param('id') id: string): Promise<Partner> {
    return await this.partnersService.getPartner(id);
  }

  @UseGuards(AuthGuard)
  @Post('/')
  async createPartner(
    @Body() createPartnerDto: CreatePartnerDto,
  ): Promise<{ message: string }> {
    return await this.partnersService.createPartner(createPartnerDto);
  }

  @UseGuards(AuthGuard)
  @Patch('/:id')
  async updatePartner(
    @Param('id') id: string,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ): Promise<CustomResponse> {
    return await this.partnersService.updatePartner(id, updatePartnerDto);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  async deletePartner(@Param('id') id: string): Promise<CustomResponse> {
    return await this.partnersService.deletePartner(id);
  }
}
