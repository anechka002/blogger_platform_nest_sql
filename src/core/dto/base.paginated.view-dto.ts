export abstract class PaginationViewDto<T> {
  abstract items: T[];

  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;

  static mapToView<T>(data: {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
  }): PaginationViewDto<T> {
    return {
      pagesCount: Math.ceil(data.totalCount / data.pageSize),
      pageSize: data.pageSize,
      page: data.page,
      totalCount: data.totalCount,
      items: data.items,
    };
  }
}
