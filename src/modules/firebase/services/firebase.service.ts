import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService<Document> {
  private firestore: admin.firestore.Firestore;

  constructor(
    @Inject('FirebaseAdmin') private readonly firebaseAdmin: admin.app.App,
  ) {
    this.firestore = this.firebaseAdmin.firestore();
  }

  async getCollection(collectionName: string): Promise<Document[]> {
    try {
      const snapshot = await this.firestore.collection(collectionName).get();

      return snapshot.docs.map((doc) => doc.data() as Document);
    } catch (e) {
      throw new Error('Error getting collection!');
    }
  }

  async createDocument(
    collectionName: string,
    data: Document,
  ): Promise<string> {
    try {
      await this.firestore.collection(collectionName).add(data);

      return 'Document successfully created!';
    } catch (e) {
      throw new Error('Error creating document!');
    }
  }

  async updateDocument(
    collectionName: string,
    documentId: string,
    data: Document,
  ): Promise<string> {
    try {
      await this.firestore.collection(collectionName).doc(documentId).set(data);

      return `Document with id: ${documentId} successfully updated!`;
    } catch (e) {
      throw new Error('Error updating document!');
    }
  }

  async deleteDocument(collectionName: string, documentId: string) {
    try {
      await this.firestore.collection(collectionName).doc(documentId).delete();

      return `Document with id: ${documentId} successfully deleted!`;
    } catch (e) {
      throw new Error('Error deleting document!');
    }
  }
}
