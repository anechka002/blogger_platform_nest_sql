import { Type } from 'class-transformer';
import { IsEnum, IsNumber } from 'class-validator';

enum SortDirectionEnum {
  Asc = 'asc',
  Desc = 'desc',
}

//базовый класс для query параметров с пагинацией
//значения по-умолчанию применятся автоматически при настройке глобального ValidationPipe в main.ts
export class BaseQueryParams {
  //для трансформации в number
  @Type(() => Number)
  @IsNumber()
  pageNumber: number = 1;
  @Type(() => Number)
  @IsNumber()
  pageSize: number = 10;
  @IsEnum(SortDirectionEnum)
  sortDirection: SortDirectionEnum = SortDirectionEnum.Desc;

  calculateSkip = () => {
    return (this.pageNumber - 1) * this.pageSize;
  };
}
