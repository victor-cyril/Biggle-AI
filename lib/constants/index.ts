export class PaginationDto {
  readonly order?: "ASC" | "DESC" = "DESC";
  readonly page: number = 1;
  readonly limit: number = 10;
  readonly isPaginated?: boolean = true;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

class PaginationMetadataDto {
  readonly page: number;
  readonly limit: number;
  readonly itemCount: number;
  readonly pageCount: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;

  constructor({
    pageOptionsDto,
    itemCount,
  }: {
    pageOptionsDto: PaginationDto;
    itemCount: number;
  }) {
    this.page = pageOptionsDto.page;
    this.limit = pageOptionsDto.limit;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / (this.limit ?? 10));
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}

export class PaginationResultDto<T> {
  readonly data: T[];
  readonly meta: PaginationMetadataDto;

  constructor(data: T[], itemCount: number, options = { page: 1, limit: 10 }) {
    this.data = data;
    this.meta = new PaginationMetadataDto({
      itemCount,
      pageOptionsDto: options as PaginationDto,
    });
  }
}
