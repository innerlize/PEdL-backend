import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseRepository } from 'src/common/domain/database-repository.interface';
import { ProjectEntity as Project } from '../../domain/entities/project.entity';

@Injectable()
export class ProjectsOrderService {
  constructor(
    @Inject('DatabaseRepository')
    private readonly databaseRepository: DatabaseRepository<Project>,
  ) {}

  private getHighestOrder(allProjects: Project[]): any {
    return {
      pedl: Math.max(...allProjects.map((p) => p.order.pedl), 0) + 1,
      cofcof: Math.max(...allProjects.map((p) => p.order.cofcof), 0) + 1,
    };
  }

  private async getProjectsToReorder(
    collectionName: string,
    deletedOrder: any,
  ): Promise<Project[]> {
    const [projectsToReorderPedl, projectsToReorderCofcof] = await Promise.all([
      this.databaseRepository.findByQuery(collectionName, {
        field: 'order.pedl',
        operator: '>',
        value: deletedOrder.pedl,
      }),
      this.databaseRepository.findByQuery(collectionName, {
        field: 'order.cofcof',
        operator: '>',
        value: deletedOrder.cofcof,
      }),
    ]);
    return [...projectsToReorderPedl, ...projectsToReorderCofcof];
  }

  private async reorderProjects(
    collectionName: string,
    projectsToReorder: Project[],
    deletedOrder: any,
  ) {
    const batch = await this.databaseRepository.batch();

    for (const project of projectsToReorder) {
      const updatedOrder = {
        pedl:
          project.order.pedl > deletedOrder.pedl
            ? project.order.pedl - 1
            : project.order.pedl,
        cofcof:
          project.order.cofcof > deletedOrder.cofcof
            ? project.order.cofcof - 1
            : project.order.cofcof,
      };

      const projectRef = await this.databaseRepository.getDocumentReference(
        collectionName,
        project.id,
      );

      batch.update(projectRef, { order: updatedOrder });
    }

    await batch.commit();
  }

  private getSortedProjects(allProjects: Project[], app: string): Project[] {
    return allProjects
      .filter((p) => p.order[app])
      .sort((a, b) => a.order[app] - b.order[app]);
  }

  private async updateProjectsOrder(
    batch: any,
    projectsInApp: Project[],
    currentOrder: number,
    newOrder: number,
    app: string,
  ): Promise<void> {
    for (const project of projectsInApp) {
      if (
        (newOrder > currentOrder &&
          project.order[app] <= newOrder &&
          project.order[app] > currentOrder) ||
        (newOrder < currentOrder &&
          project.order[app] >= newOrder &&
          project.order[app] < currentOrder)
      ) {
        const updatedOrder =
          project.order[app] + (newOrder < currentOrder ? 1 : -1);
        const projectRef = await this.databaseRepository.getDocumentReference(
          'projects',
          project.id,
        );
        batch.update(projectRef, { [`order.${app}`]: updatedOrder });
      }
    }
  }

  async assignInitialOrder(
    collectionName: string,
    createProjectDto: any,
  ): Promise<any> {
    const allProjects = await this.databaseRepository.findAll(collectionName);
    const highestOrder = this.getHighestOrder(allProjects);

    return {
      ...createProjectDto,
      order: highestOrder,
    };
  }

  async reorderAfterDelete(
    collectionName: string,
    deletedOrder: any,
  ): Promise<void> {
    const projectsToReorder = await this.getProjectsToReorder(
      collectionName,
      deletedOrder,
    );
    await this.reorderProjects(collectionName, projectsToReorder, deletedOrder);
  }

  async updateOrder(
    collectionName: string,
    projectId: string,
    newOrder: number,
    app: string,
  ): Promise<void> {
    const allProjects = await this.databaseRepository.findAll(collectionName);
    const projectToUpdate = allProjects.find((p) => p.id === projectId);

    if (!projectToUpdate)
      throw new NotFoundException(`Project with id "${projectId}" not found`);

    const currentOrder = projectToUpdate.order[app];
    if (currentOrder === newOrder) {
      throw new ConflictException(
        `Project already has order "${newOrder}" in app "${app}"`,
      );
    }

    const batch = await this.databaseRepository.batch();
    const projectsInApp = this.getSortedProjects(allProjects, app);

    await this.updateProjectsOrder(
      batch,
      projectsInApp,
      currentOrder,
      newOrder,
      app,
    );
    projectToUpdate.order[app] = newOrder;

    const projectRef = await this.databaseRepository.getDocumentReference(
      collectionName,
      projectId,
    );
    batch.update(projectRef, { [`order.${app}`]: newOrder });

    await batch.commit();
  }
}
