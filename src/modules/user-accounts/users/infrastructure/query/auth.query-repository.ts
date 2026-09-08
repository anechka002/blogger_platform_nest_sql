import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users.repository';
import { MeViewDto } from '../../api/view-dto/me.view.dto';
import { Types } from 'mongoose';

@Injectable()
export class AuthQueryRepository {
  constructor(private usersRepository: UsersRepository) {}

  async me(userId: string): Promise<MeViewDto> {
    const user = await this.usersRepository.findOrNotFoundFail(
      new Types.ObjectId(userId),
    );

    return MeViewDto.mapToView(user);
  }
}
