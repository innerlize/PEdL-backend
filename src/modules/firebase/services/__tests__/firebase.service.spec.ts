import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from '../firebase.service';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin', () => {
  const firestore = {
    collection: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      docs: [
        { data: () => ({ id: 1, name: 'Test' }) },
        { data: () => ({ id: 2, name: 'Test 2' }) },
      ],
    }),
    doc: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };
  return {
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
    },
    firestore: jest.fn(() => firestore),
  };
});

interface TestDocument {
  id: number;
  name: string;
}

describe('FirebaseService', () => {
  let service: FirebaseService<TestDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseService,
        {
          provide: 'FirebaseAdmin',
          useValue: admin,
        },
      ],
    }).compile();

    service = module.get<FirebaseService<TestDocument>>(FirebaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get collection', async () => {
    const result = await service.getCollection('test');
    expect(result).toEqual([
      { id: 1, name: 'Test' },
      { id: 2, name: 'Test 2' },
    ]);
  });

  it('should create document', async () => {
    const result = await service.createDocument('test', {
      id: 3,
      name: 'New Document',
    });
    expect(result).toBe('Document successfully created!');
  });

  it('should update document', async () => {
    const result = await service.updateDocument('test', 'docId', {
      id: 3,
      name: 'Updated Document',
    });
    expect(result).toBe('Document with id: docId successfully updated!');
  });

  it('should delete document', async () => {
    const result = await service.deleteDocument('test', 'docId');
    expect(result).toBe('Document with id: docId successfully deleted!');
  });
});
