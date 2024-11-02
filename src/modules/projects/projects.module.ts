import { Module } from '@nestjs/common';
import { ProjectsService } from './application/services/projects.service';
import { DatabaseModule } from '../database/database.module';
import { ProjectsController } from './controllers/projects.controller';
import { AuthModule } from '../auth/auth.module';
import { ProjectsOrderService } from './application/services/projects-order.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [AuthModule, DatabaseModule, StorageModule],
  providers: [ProjectsService, ProjectsOrderService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
