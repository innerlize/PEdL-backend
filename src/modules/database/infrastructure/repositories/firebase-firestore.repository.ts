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

  async findOrderedByField(
    collectionName: string,
    fieldName: string,
    order: 'asc' | 'desc',
    limit: number,
  ): Promise<T[]> {
    const querySnapshot = await this.firestore
      .collection(collectionName)
      .orderBy(fieldName, order)
      .limit(limit)
      .get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.createTime,
      updated_at: doc.updateTime,
    })) as T[];
  }

  async getDocumentReference(
    collectionName: string,
    id: string,
  ): Promise<admin.firestore.DocumentReference<T>> {
    return (await this.firestore
      .collection(collectionName)
      .doc(id)) as admin.firestore.DocumentReference<T>;
  }

  async getSubcollectionData(
    collectionName: string,
    parentId: string,
    subcollectionName: string,
  ): Promise<any[]> {
    const subcollectionRef = this.firestore
      .collection(collectionName)
      .doc(parentId)
      .collection(subcollectionName);

    const querySnapshot = await subcollectionRef.get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.createTime,
      updated_at: doc.updateTime,
    }));
  }

  async getDocumentDataFromSubcollectionById(
    collectionName: string,
    parentId: string,
    subcollectionName: string,
    documentId: string,
  ): Promise<any> {
    const subcollectionDocRef = this.firestore
      .collection(collectionName)
      .doc(parentId)
      .collection(subcollectionName)
      .doc(documentId);
    const subcollectionDoc = await subcollectionDocRef.get();

    if (!subcollectionDoc.exists) {
      throw new NotFoundException(
        `Subcollection document with id "${documentId}" not found`,
      );
    }

    return {
      id: subcollectionDoc.id,
      ...subcollectionDoc.data(),
      created_at: subcollectionDoc.createTime,
      updated_at: subcollectionDoc.updateTime,
    };
  }

  async documentExistsInSubcollection(
    collectionName: string,
    parentId: string,
    subcollectionName: string,
    query: Partial<Record<string, any>>,
  ): Promise<boolean> {
    try {
      const subcollectionRef = this.firestore
        .collection(collectionName)
        .doc(parentId)
        .collection(subcollectionName);

      const querySnapshot = await subcollectionRef
        .where(Object.keys(query)[0], '==', Object.values(query)[0])
        .get();

      return !querySnapshot.empty;
    } catch (e) {
      throw new BadRequestException(
        `Error checking document existence in subcollection: ${e.message}`,
      );
    }
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

  async createBatch(): Promise<admin.firestore.WriteBatch> {
    return this.firestore.batch();
  }

  async addToSubcollection(
    collectionName: string,
    parentId: string,
    subcollectionName: string,
    data: any,
  ): Promise<void> {
    try {
      await this.firestore
        .collection(collectionName)
        .doc(parentId)
        .collection(subcollectionName)
        .add(data);
    } catch (e) {
      throw new BadRequestException(
        `Error adding document to subcollection: ${e.message}`,
      );
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

  async updateArrayField(
    collectionName: string,
    id: string,
    field: string,
    value: any,
    operation: 'add' | 'remove',
  ): Promise<void> {
    const fieldValue =
      operation === 'add'
        ? admin.firestore.FieldValue.arrayUnion(value)
        : admin.firestore.FieldValue.arrayRemove(value);

    await this.firestore
      .collection(collectionName)
      .doc(id)
      .update({
        [field]: fieldValue,
      });
  }

  async delete(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = this.firestore.collection(collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundException(`Document with id "${id}" not found`);
      }

      await this.firestore.recursiveDelete(docRef);
    } catch (e) {
      throw new BadRequestException('Error deleting document: ' + e.message);
    }
  }

  async deleteFromSubcollection(
    parentCollection: string,
    parentId: string,
    subcollectionName: string,
    documentId: string,
  ): Promise<void> {
    try {
      const docRef = this.firestore
        .collection(parentCollection)
        .doc(parentId)
        .collection(subcollectionName)
        .doc(documentId);

      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundException(
          `Document with id "${documentId}" not found in subcollection "${subcollectionName}" of document with id "${parentId}".`,
        );
      }

      await docRef.delete();

      console.log(
        `Document with id "${documentId}" successfully deleted from subcollection "${subcollectionName}" of document with id "${parentId}".`,
      );
    } catch (e) {
      throw new BadRequestException(
        `Error deleting document from subcollection: ${e.message}`,
      );
    }
  }
}
