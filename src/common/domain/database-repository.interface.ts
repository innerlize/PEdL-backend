import * as admin from 'firebase-admin';
import { QueryOptions } from '../../modules/database/domain/interfaces/query-options.interface';

export interface DatabaseRepository<T> {
  findAll(collectionName: string): Promise<T[]>;
  findById(collectionName: string, id: string): Promise<T>;
  findByQuery(collectionName: string, queryOptions: QueryOptions): Promise<T[]>;
  findOrderedByField(
    collectionName: string,
    fieldName: string,
    order: 'asc' | 'desc',
    limit: number,
  ): Promise<T[]>;
  getDocumentReference(
    collectionName: string,
    id: string,
  ): Promise<admin.firestore.DocumentReference<T>>;
  getSubcollectionData(
    collectionName: string,
    parentId: string,
    subcollectionName: string,
  ): Promise<any[]>;
  getDocumentDataFromSubcollectionById(
    collectionName: string,
    parentId: string,
    subcollectionName: string,
    documentId: string,
  ): Promise<any>;
  documentExistsInSubcollection(
    collectionName: string,
    parentId: string,
    subcollectionName: string,
    query: Partial<Record<string, any>>,
  ): Promise<boolean>;
  create(collectionName: string, data: any): Promise<T>;
  createBatch(): Promise<admin.firestore.WriteBatch>;
  addToSubcollection(
    collectionName: string,
    parentId: string,
    subcollectionName: string,
    data: any,
  ): Promise<void>;
  update(collectionName: string, id: string, data: any): Promise<T>;
  updateArrayField(
    collectionName: string,
    id: string,
    field: string,
    value: any,
    operation: 'add' | 'remove',
  ): Promise<void>;
  delete(collectionName: string, id: string): Promise<void>;
  deleteFromSubcollection(
    parentCollection: string,
    parentId: string,
    subcollectionName: string,
    documentId: string,
  ): Promise<void>;
}
