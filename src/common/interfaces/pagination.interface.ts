export interface Pagination<T> {
  pageNo: number;
  pageSize: number;
  total: number;
  page: T[];
}
