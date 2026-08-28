import { ApiProperty } from '@nestjs/swagger';

export abstract class PaginationViewDto<T> {
  abstract items: T[];

  @ApiProperty({ example: 0 })
  pagesCount: number;

  @ApiProperty({ example: 0 })
  page: number;

  @ApiProperty({ example: 0 })
  pageSize: number;

  @ApiProperty({ example: 0 })
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
