import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class IdInputDto {
  @IsMongoId()
  id: Types.ObjectId;
}
