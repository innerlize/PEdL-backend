import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PartnersController } from './controllers/partners.controller';
import { PartnersService } from './application/services/partners.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [PartnersService],
  controllers: [PartnersController],
})
export class PartnersModule {}
