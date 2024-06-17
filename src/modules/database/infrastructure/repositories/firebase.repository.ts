import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { DatabaseRepository } from '../../../../common/domain/database-repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FirebaseRepository<T> implements DatabaseRepository<T> {
  private firestore: admin.firestore.Firestore;

  constructor(
    @Inject('FirebaseAdmin') private readonly firebaseAdmin: admin.app.App,
  ) {
    this.firestore = this.firebaseAdmin.firestore();
  }

  async findAll(collectionName: string): Promise<T[]> {
    const snapshot = await this.firestore.collection(collectionName).get();
    return snapshot.docs.map((doc) => doc.data() as T);
  }

  async findById(collectionName: string, id: string): Promise<T> {
    const doc = await this.firestore.collection(collectionName).doc(id).get();
    return doc.data() as T;
  }

  async create(collectionName: string, data: T): Promise<string> {
    const id = uuidv4();
    await this.firestore.collection(collectionName).add({ ...data, id });
    return 'Document successfully created!';
  }

  async update(collectionName: string, id: string, data: T): Promise<string> {
    await this.firestore.collection(collectionName).doc(id).set(data);
    return `Document with id: ${id} successfully updated!`;
  }

  async delete(collectionName: string, id: string): Promise<string> {
    await this.firestore.collection(collectionName).doc(id).delete();
    return `Document with id: ${id} successfully deleted!`;
  }
}
