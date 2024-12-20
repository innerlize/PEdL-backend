import * as admin from 'firebase-admin';
import { QueryOptions } from '../../modules/database/domain/interfaces/query-options.interface';

export interface DatabaseRepository<T> {
  findAll(collectionName: string): Promise<T[]>;
  findById(collectionName: string, id: string): Promise<T>;
  findByQuery(collectionName: string, queryOptions: QueryOptions): Promise<T[]>;
  getDocumentReference(
    collectionName: string,
    id: string,
  ): Promise<admin.firestore.DocumentReference<T>>;
  getCollectionReference(
    collectionName: string,
  ): Promise<admin.firestore.CollectionReference>;
  create(collectionName: string, data: any): Promise<T>;
  update(collectionName: string, id: string, data: any): Promise<T>;
  appendMediaUrls(
    collectionName: string,
    id: string,
    mediaType: 'images' | 'videos',
    urls: string[],
  ): Promise<void>;
  delete(collectionName: string, id: string): Promise<void>;
  batch(): Promise<admin.firestore.WriteBatch>;
}
