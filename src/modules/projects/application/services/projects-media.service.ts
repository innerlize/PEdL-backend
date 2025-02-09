import { AppNames } from '@common/domain/app-names.enum';
import { DatabaseRepository } from '@common/domain/database-repository.interface';
import { StorageRepository } from '@common/domain/storage-repository.interface';
import { DeleteFileFromProjectParams } from '@modules/projects/application/dtos/delete-file-from-project.params';
import { ProjectEntity as Project } from '@modules/projects/domain/entities/project.entity';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ProjectsMediaService {
  private readonly collectionName = 'projects';

  constructor(
    @Inject('DatabaseRepository')
    private readonly databaseRepository: DatabaseRepository<Project>,
    @Inject('StorageRepository')
    private readonly storageRepository: StorageRepository,
  ) {}

  async updateThumbnails(
    id: string,
    urls?: Partial<Record<AppNames, string>>,
    files?: Partial<Record<AppNames, Express.Multer.File>>,
  ): Promise<void> {
    const project = await this.databaseRepository.findById(
      this.collectionName,
      id,
    );

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found.`);
    }

    for (const app of Object.values(AppNames)) {
      if (urls?.[app]) {
        await this.databaseRepository.updateArrayField(
          this.collectionName,
          id,
          `thumbnails.${app}`,
          urls[app]!,
          'add',
        );
      }

      if (files?.[app]) {
        const storagePath = `${this.collectionName}/${id}/thumbnails/${app}`;
        const [uploadedUrl] = await this.storageRepository.uploadFiles(
          storagePath,
          [files[app]!],
          { id: project.id },
        );

        await this.databaseRepository.updateArrayField(
          this.collectionName,
          id,
          `thumbnails.${app}`,
          uploadedUrl,
          'add',
        );
      }
    }
  }

  async updateMedia(
    projectId: string,
    urls?: Partial<Record<'images' | 'videos', string[]>>,
    files?: Partial<Record<'images' | 'videos', Express.Multer.File[]>>,
  ): Promise<void> {
    const project = await this.databaseRepository.findById(
      this.collectionName,
      projectId,
    );

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }

    for (const mediaType of ['images', 'videos'] as const) {
      if (urls?.[mediaType]?.length) {
        for (const url of urls[mediaType]!) {
          const exists =
            await this.databaseRepository.documentExistsInSubcollection(
              this.collectionName,
              projectId,
              mediaType,
              { url },
            );

          if (exists) {
            throw new ConflictException('Media already exists');
          }

          await this.databaseRepository.addToSubcollection(
            this.collectionName,
            projectId,
            mediaType,
            { url, visibility: { pedl: false, cofcof: false } },
          );
        }
      }

      if (files?.[mediaType]?.length) {
        const storagePath = `${this.collectionName}/${projectId}/${mediaType}`;
        const uploadedUrls = await this.storageRepository.uploadFiles(
          storagePath,
          files[mediaType]!,
          { id: projectId },
        );

        for (const uploadedUrl of uploadedUrls) {
          const exists =
            await this.databaseRepository.documentExistsInSubcollection(
              this.collectionName,
              projectId,
              mediaType,
              { url: uploadedUrl },
            );

          if (exists) {
            throw new ConflictException('Media already exists');
          }

          await this.databaseRepository.addToSubcollection(
            this.collectionName,
            projectId,
            mediaType,
            { url: uploadedUrl, visibility: { pedl: false, cofcof: false } },
          );
        }
      }
    }
  }

  async deleteFileFromProject({
    projectId,
    fileId,
    fileType,
  }: DeleteFileFromProjectParams): Promise<void> {
    const mediaSubCollectionName = fileType === 'image' ? 'images' : 'videos';

    const file: {
      url: string;
      visibility: { pedl: boolean; cofcof: boolean };
    } = await this.databaseRepository.getDocumentDataFromSubcollectionById(
      this.collectionName,
      projectId,
      mediaSubCollectionName,
      fileId,
    );

    console.log('Este es el file', file);

    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found.`);
    }

    try {
      await this.storageRepository.deleteFile(file.url);
      await this.databaseRepository.deleteFromSubcollection(
        this.collectionName,
        projectId,
        mediaSubCollectionName,
        fileId,
      );
    } catch (error) {
      if (
        error.message.includes('No such object') ||
        error.message.includes('Invalid file URL')
      ) {
        console.warn(
          'File URL not found in storage, removing media URL from subcollection directly...',
        );

        await this.databaseRepository.deleteFromSubcollection(
          this.collectionName,
          projectId,
          mediaSubCollectionName,
          fileId,
        );
      } else {
        throw new Error('Error deleting file from storage: ' + error.message);
      }
    }
  }
}
