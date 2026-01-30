import { PaginationMetadata } from "./paginationMetadata";

export interface PaginationResult<T> {
  items: T[],
  metadata: PaginationMetadata
}