import { Inject, Injectable } from '@nestjs/common';
import { ProjectEntity as Project } from '@modules/projects/domain/entities/project.entity';
import { ProjectOrderByApp } from '@modules/projects/domain/interfaces/project-order-by-app.interface';
import { DatabaseRepository } from '@common/domain/database-repository.interface';

@Injectable()
export class ProjectsOrderRepository {
  private readonly collectionName = 'projects';
  private readonly BASE_ORDER_VALUE = 0;
  private readonly MAX_RESULTS = 1;

  constructor(
    @Inject('DatabaseRepository')
    private readonly databaseRepository: DatabaseRepository<Project>,
  ) {}

  async getHighestOrderValues(): Promise<ProjectOrderByApp> {
    const [highestPedlOrder, highestCofcofOrder] = await Promise.all([
      this.databaseRepository.findOrderedByField(
        this.collectionName,
        'order.pedl',
        'desc',
        this.MAX_RESULTS,
      ),
      this.databaseRepository.findOrderedByField(
        this.collectionName,
        'order.cofcof',
        'desc',
        this.MAX_RESULTS,
      ),
    ]);

    return {
      pedl: highestPedlOrder[0]?.order.pedl ?? this.BASE_ORDER_VALUE,
      cofcof: highestCofcofOrder[0]?.order.cofcof ?? this.BASE_ORDER_VALUE,
    };
  }

  async findProjectsWithOrderGreaterThan(
    app: string,
    deletedOrder: number,
  ): Promise<Project[]> {
    const querySnapshot = await this.databaseRepository.findByQuery(
      this.collectionName,
      {
        field: `order.${app}`,
        operator: '>',
        value: deletedOrder,
      },
    );
    return querySnapshot;
  }

  async updateProjectOrder(
    projectId: string,
    app: string,
    newOrder: number,
  ): Promise<void> {
    await this.databaseRepository.update(this.collectionName, projectId, {
      [`order.${app}`]: newOrder,
    });
  }

  async batchUpdateProjects(
    projectsToUpdate: { id: string; order: ProjectOrderByApp }[],
  ): Promise<void> {
    const batch = await this.databaseRepository.createBatch();

    for (const project of projectsToUpdate) {
      const projectRef = await this.databaseRepository.getDocumentReference(
        this.collectionName,
        project.id,
      );
      batch.update(projectRef, { order: project.order });
    }

    await batch.commit();
  }
}
