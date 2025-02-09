export interface StorageRepository {
  uploadFiles(
    storagePath: string,
    files: Express.Multer.File[],
    customMetadata?: Record<string, string>,
  ): Promise<string[]>;
  deleteFile(fileUrl: string): Promise<void>;
  deleteAllFilesFromFolder(
    rootFolder: string,
    objectFolder: string,
  ): Promise<void>;
}
