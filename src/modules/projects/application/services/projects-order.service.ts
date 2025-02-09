import { ProjectOrderByApp } from '@modules/projects/domain/interfaces/project-order-by-app.interface';
import { ProjectsOrderRepository } from '@modules/projects/infrastructure/projects-order.repository';
import { Injectable, ConflictException } from '@nestjs/common';

@Injectable()
export class ProjectsOrderService {
  private readonly DEFAULT_ORDER_INCREMENT = 1;
  private readonly MIN_ORDER_OFFSET = 1;

  constructor(
    private readonly projectsOrderRepository: ProjectsOrderRepository,
  ) {}

  async getHighestAvailableOrder(): Promise<ProjectOrderByApp> {
    const highestOrder =
      await this.projectsOrderRepository.getHighestOrderValues();

    return {
      pedl: highestOrder.pedl + this.DEFAULT_ORDER_INCREMENT,
      cofcof: highestOrder.cofcof + this.DEFAULT_ORDER_INCREMENT,
    };
  }

  async updateOrder(
    projectId: string,
    currentOrder: number,
    newOrder: number,
    app: string,
  ): Promise<void> {
    if (currentOrder === newOrder) {
      throw new ConflictException(
        `Project already has order "${newOrder}" in app "${app}"`,
      );
    }

    const allProjects =
      await this.projectsOrderRepository.findProjectsWithOrderGreaterThan(
        app,
        Math.min(currentOrder, newOrder) - this.MIN_ORDER_OFFSET,
      );

    const projectsToUpdate = allProjects.map((project) => ({
      id: project.id,
      order: {
        ...project.order,
        [app]:
          project.order[app] +
          (newOrder < currentOrder
            ? this.MIN_ORDER_OFFSET
            : -this.MIN_ORDER_OFFSET),
      },
    }));

    await this.projectsOrderRepository.batchUpdateProjects(projectsToUpdate);
    await this.projectsOrderRepository.updateProjectOrder(
      projectId,
      app,
      newOrder,
    );
  }

  async reorderAfterDelete(deletedOrder: ProjectOrderByApp): Promise<void> {
    const [projectsPedl, projectsCofcof] = await Promise.all([
      this.projectsOrderRepository.findProjectsWithOrderGreaterThan(
        'pedl',
        deletedOrder.pedl,
      ),
      this.projectsOrderRepository.findProjectsWithOrderGreaterThan(
        'cofcof',
        deletedOrder.cofcof,
      ),
    ]);

    const projectsToUpdate = [...projectsPedl, ...projectsCofcof].map(
      (project) => {
        return {
          id: project.id,
          order: {
            pedl:
              project.order.pedl > deletedOrder.pedl
                ? project.order.pedl - this.MIN_ORDER_OFFSET
                : project.order.pedl,
            cofcof:
              project.order.cofcof > deletedOrder.cofcof
                ? project.order.cofcof - this.MIN_ORDER_OFFSET
                : project.order.cofcof,
          },
        };
      },
    );

    await this.projectsOrderRepository.batchUpdateProjects(projectsToUpdate);
  }
}
