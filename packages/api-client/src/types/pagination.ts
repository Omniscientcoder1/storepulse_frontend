/** Mirrors `storepulse_backend/app/schemas/pagination.py`'s `Page[T]` envelope. */
export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
