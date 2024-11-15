import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Bucket, GetFilesResponse } from '@google-cloud/storage';
import { StorageRepository } from '../../../../common/domain/storage-repository.interface';
import { MemoryStoredFile } from 'nestjs-form-data';

@Injectable()
export class FirebaseStorageRepository implements StorageRepository {
  private storage: admin.storage.Storage;
  private bucket: Bucket;

  constructor(
    @Inject('FirebaseAdmin') private readonly firebaseAdmin: admin.app.App,
  ) {
    this.storage = this.firebaseAdmin.storage();
    this.bucket = this.storage.bucket();
  }

  private generateFileLocation(mediaType: string, filename: string): string {
    return `${mediaType}/${filename}`;
  }

  async getFile(fileUrl: string): Promise<string> {
    const file = await this.bucket.file(fileUrl);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file.publicUrl();
  }

  async uploadFiles(
    mediaType: string,
    files: MemoryStoredFile[],
    generationMatchPrecondition?: number,
  ): Promise<string[]> {
    const filesUrls: string[] = [];

    for (const file of files) {
      const location = this.generateFileLocation(mediaType, file.originalName);
      const fileName = location;
      const fileToUpload = this.bucket.file(fileName);

      await fileToUpload.save(file.buffer, {
        contentType: file.mimetype,
        metadata: {
          contentDisposition: 'inline',
        },
        preconditionOpts: {
          ifGenerationMatch: generationMatchPrecondition,
        },
      });

      await fileToUpload.makePublic();

      filesUrls.push(fileToUpload.publicUrl());
    }

    return filesUrls;
  }

  async renameFilesFolder(
    rootFolder: string,
    currentObjectFolderName: string,
    newObjectFolderName: string,
  ): Promise<void> {
    await this.bucket
      .getFiles({ prefix: `${rootFolder}/${currentObjectFolderName}/` })
      .then(async (response: GetFilesResponse) => {
        for (const file of response[0]) {
          const newFilePath = file.name.replace(
            `${rootFolder}/${currentObjectFolderName}/`,
            `${rootFolder}/${newObjectFolderName}/`,
          );
          await file.rename(newFilePath);
        }
      });
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const decodedUrl = decodeURIComponent(fileUrl);
    const relativePath = decodedUrl.split('.appspot.com/')[1];

    if (!relativePath) {
      throw new Error('Invalid file URL');
    }

    await this.bucket.file(relativePath).delete();
  }

  async deleteAllFilesFromFolder(
    rootFolder: string,
    objectFolder: string,
  ): Promise<void> {
    await this.bucket.deleteFiles({ prefix: `${rootFolder}/${objectFolder}/` });
  }
}
