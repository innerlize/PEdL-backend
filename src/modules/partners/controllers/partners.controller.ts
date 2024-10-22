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
import { CustomResponse } from '../../../common/domain/custom-response.interface';
import { PartnersService } from '../application/services/partners.service';
import { Partner } from '../domain/interfaces/partner.interface';
import { CreatePartnerDto } from '../application/dtos/create-partner.dto';
import { UpdatePartnerDto } from '../application/dtos/update-partner.dto';
import { AuthGuard } from '../../../common/application/guards/auth.guard';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Partners')
@Controller('api/partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get('/')
  @ApiOkResponse({ type: Partner, isArray: true })
  async getAllPartners(): Promise<Partner[]> {
    return await this.partnersService.getAllPartners();
  }

  @Get('/:id')
  @ApiOkResponse({ type: Partner })
  async getPartner(@Param('id') id: string): Promise<Partner> {
    return await this.partnersService.getPartner(id);
  }

  @UseGuards(AuthGuard)
  @Post('/')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CustomResponse })
  async createPartner(
    @Body() createPartnerDto: CreatePartnerDto,
  ): Promise<{ message: string }> {
    return await this.partnersService.createPartner(createPartnerDto);
  }

  @UseGuards(AuthGuard)
  @Patch('/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CustomResponse })
  async updatePartner(
    @Param('id') id: string,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ): Promise<CustomResponse> {
    return await this.partnersService.updatePartner(id, updatePartnerDto);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: CustomResponse })
  async deletePartner(@Param('id') id: string): Promise<CustomResponse> {
    return await this.partnersService.deletePartner(id);
  }
}
