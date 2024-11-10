import { MemoryStoredFile } from 'nestjs-form-data';

export interface StorageRepository {
  uploadFiles(mediaType: any, files: MemoryStoredFile[]): Promise<string[]>;
  renameFilesFolder(
    rootFolder: string,
    currentObjectFolderName: string,
    newObjectFolderName: string,
  ): Promise<void>;
  deleteFile(fileUrl: string): Promise<void>;
  deleteAllFilesFromFolder(
    rootFolder: string,
    objectFolder: string,
  ): Promise<void>;
}
