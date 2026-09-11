import { Injectable } from '@nestjs/common';
import { MeViewDto } from '../../api/view-dto/me.view.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, type UserModelType } from '../../domain/user.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class AuthQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  // Найти me по id
  async meOrNotFoundFail(userId: string): Promise<MeViewDto> {
    const user = await this.UserModel.findOne({
      _id: userId,
      deletedAt: null,
    });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return MeViewDto.mapToView(user);
  }
}
