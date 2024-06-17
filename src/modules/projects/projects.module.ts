import { Module } from '@nestjs/common';
import { ProjectsService } from './infrastructure/services/projects.service';
import { DatabaseModule } from '../database/database.module';
import { ProjectsController } from './infrastructure/controllers/projects.controller';

@Module({
  imports: [DatabaseModule],
  providers: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
