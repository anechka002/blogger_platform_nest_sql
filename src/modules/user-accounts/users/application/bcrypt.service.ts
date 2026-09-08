import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BcryptService {
  async generateHash(password: string) {
    const salt = await bcrypt.genSalt(10);
    // console.log('salt', salt)
    return bcrypt.hash(password, salt);
  }

  async checkPassword({ password, hash }: { password: string; hash: string }) {
    return await bcrypt.compare(password, hash);
  }
}
