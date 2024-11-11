import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { DatabaseRepository } from '../../../../common/domain/database-repository.interface';
import { QueryOptions } from '../../domain/interfaces/query-options.interface';

@Injectable()
export class FirestoreRepository<T> implements DatabaseRepository<T> {
  private firestore: admin.firestore.Firestore;

  constructor(
    @Inject('FirebaseAdmin') private readonly firebaseAdmin: admin.app.App,
  ) {
    this.firestore = this.firebaseAdmin.firestore();
  }

  async findAll(collectionName: string): Promise<T[]> {
    try {
      const snapshot = await this.firestore.collection(collectionName).get();

      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            created_at: doc.createTime,
            updated_at: doc.updateTime,
          }) as T,
      );
    } catch (e) {
      throw new BadRequestException('Error getting collection: ' + e.message);
    }
  }

  async findById(collectionName: string, id: string): Promise<T> {
    const doc = await this.firestore.collection(collectionName).doc(id).get();

    if (!doc.exists) {
      throw new NotFoundException(`Document with id "${id}" not found`);
    }

    return {
      id: doc.id,
      ...doc.data(),
      created_at: doc.createTime,
      updated_at: doc.updateTime,
    } as T;
  }

  async findByQuery(
    collectionName: string,
    queryOptions: QueryOptions,
  ): Promise<T[]> {
    try {
      const collectionRef = this.firestore.collection(collectionName);

      const snapshot = await collectionRef
        .where(queryOptions.field, queryOptions.operator, queryOptions.value)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.createTime,
        updated_at: doc.updateTime,
      })) as T[];
    } catch (e) {
      throw new BadRequestException('Error querying documents: ' + e.message);
    }
  }

  async getDocumentReference(
    collectionName: string,
    id: string,
  ): Promise<admin.firestore.DocumentReference<T>> {
    return (await this.firestore
      .collection(collectionName)
      .doc(id)) as admin.firestore.DocumentReference<T>;
  }

  async getCollectionReference(
    collectionName: string,
  ): Promise<admin.firestore.CollectionReference> {
    return this.firestore.collection(collectionName);
  }

  async create(collectionName: string, data: any): Promise<T> {
    try {
      const docRef = await this.firestore.collection(collectionName).add(data);
      const doc = await docRef.get();

      return {
        id: doc.id,
        ...doc.data(),
        created_at: doc.createTime,
        updated_at: doc.updateTime,
      } as T;
    } catch (e) {
      throw new BadRequestException('Error creating document: ' + e.message);
    }
  }

  async update(collectionName: string, id: string, data: any): Promise<T> {
    try {
      const docRef = this.firestore.collection(collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundException(`Document with id "${id}" not found`);
      }

      await docRef.update(data);

      const updatedDoc = await docRef.get();

      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        created_at: doc.createTime,
        updated_at: doc.updateTime,
      } as T;
    } catch (e) {
      throw new BadRequestException('Error updating document: ' + e.message);
    }
  }

  async delete(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = this.firestore.collection(collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundException(`Document with id "${id}" not found`);
      }

      await docRef.delete();
    } catch (e) {
      throw new BadRequestException('Error deleting document: ' + e.message);
    }
  }

  async batch(): Promise<admin.firestore.WriteBatch> {
    return this.firestore.batch();
  }
}
