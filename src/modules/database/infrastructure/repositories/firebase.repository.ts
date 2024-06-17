import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { DatabaseRepository } from '../../../../common/domain/database-repository.interface';

@Injectable()
export class FirebaseRepository<T> implements DatabaseRepository<T> {
  private firestore: admin.firestore.Firestore;

  constructor(
    @Inject('FirebaseAdmin') private readonly firebaseAdmin: admin.app.App,
  ) {
    this.firestore = this.firebaseAdmin.firestore();
  }

  async findAll(collectionName: string): Promise<(T & { id: string })[]> {
    try {
      const snapshot = await this.firestore.collection(collectionName).get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as T),
      }));
    } catch (e) {
      throw new BadRequestException('Error getting collection: ' + e.message);
    }
  }

  async findById(collectionName: string, id: string): Promise<T> {
    const doc = await this.firestore.collection(collectionName).doc(id).get();

    if (!doc.exists) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }

    return { id: doc.id, ...doc.data() } as T;
  }

  async create(collectionName: string, data: any): Promise<string> {
    try {
      await this.firestore.collection(collectionName).add(data);

      return 'Document successfully created!';
    } catch (e) {
      throw new BadRequestException('Error creating document: ' + e.message);
    }
  }

  async update(collectionName: string, id: string, data: any): Promise<string> {
    try {
      const docRef = this.firestore.collection(collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundException(`Document with id ${id} not found`);
      }

      await docRef.update(data);

      return `Document with id: ${id} successfully updated!`;
    } catch (e) {
      throw new BadRequestException('Error updating document: ' + e.message);
    }
  }

  async delete(collectionName: string, id: string): Promise<string> {
    try {
      const docRef = this.firestore.collection(collectionName).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundException(`Document with id ${id} not found`);
      }

      await docRef.delete();

      return `Document with id: ${id} successfully deleted!`;
    } catch (e) {
      throw new BadRequestException('Error deleting document: ' + e.message);
    }
  }
}
