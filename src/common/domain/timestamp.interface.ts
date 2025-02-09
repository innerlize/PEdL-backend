import { firestore } from 'firebase-admin';

export type Timestamp = Pick<firestore.Timestamp, 'seconds' | 'nanoseconds'>;
