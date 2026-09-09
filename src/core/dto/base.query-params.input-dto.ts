import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

enum SortDirectionEnum {
  Asc = 'asc',
  Desc = 'desc',
}

//базовый класс для query параметров с пагинацией
//значения по-умолчанию применятся автоматически при настройке глобального ValidationPipe в main.ts
export class BaseQueryParams {
  //для трансформации в number
  @ApiPropertyOptional({
    default: 1,
    description: 'pageNumber is number of portions that should be returned',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber: number = 1;

  @ApiPropertyOptional({
    default: 10,
    description: 'pageSize is portions size that should be returned',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 10;

  @ApiPropertyOptional({
    default: SortDirectionEnum.Desc,
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsEnum(SortDirectionEnum)
  sortDirection: SortDirectionEnum = SortDirectionEnum.Desc;

  calculateSkip(): number {
    return (this.pageNumber - 1) * this.pageSize;
  }
}
