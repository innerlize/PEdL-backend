import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Bucket } from '@google-cloud/storage';
import { StorageRepository } from '../../../../common/domain/storage-repository.interface';

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

  private generateFileLocation(storagePath: string, filename: string): string {
    return `${storagePath}/${filename}`;
  }

  async uploadFiles(
    storagePath: string,
    files: Express.Multer.File[],
    customMetadata?: Record<string, string>,
  ): Promise<string[]> {
    const uploadedFilesUrls: string[] = [];

    for (const file of files) {
      const location = this.generateFileLocation(
        storagePath,
        file.originalname,
      );
      const fileName = location;
      const fileToUpload = this.bucket.file(fileName);

      await fileToUpload.save(file.buffer, {
        contentType: file.mimetype,
        metadata: {
          contentDisposition: 'inline',
          customMetadata,
        },
      });

      await fileToUpload.makePublic();

      uploadedFilesUrls.push(fileToUpload.publicUrl());
    }

    return uploadedFilesUrls;
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
