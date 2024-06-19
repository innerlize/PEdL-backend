export interface DatabaseRepository<T> {
  findAll(collectionName: string): Promise<T[]>;
  findById(collectionName: string, id: string): Promise<T>;
  create(collectionName: string, data: any): Promise<T>;
  update(collectionName: string, id: string, data: any): Promise<T>;
  delete(collectionName: string, id: string): Promise<void>;
}
