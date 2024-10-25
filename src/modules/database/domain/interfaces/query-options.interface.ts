export interface QueryOptions {
  field: string;
  operator: FirebaseFirestore.WhereFilterOp;
  value: any;
}
