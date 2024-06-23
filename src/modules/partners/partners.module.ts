import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PartnersController } from './controllers/partners.controller';
import { PartnersService } from './application/services/partners.service';

@Module({
  imports: [DatabaseModule],
  providers: [PartnersService],
  controllers: [PartnersController],
})
export class PartnersModule {}
