import { Module } from '@nestjs/common';
import { ProjectsService } from './application/services/projects.service';
import { DatabaseModule } from '../database/database.module';
import { ProjectsController } from './controllers/projects.controller';

@Module({
  imports: [DatabaseModule],
  providers: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
