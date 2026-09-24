import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

const SALT = 10;

@Injectable()
export class PasswordService {
  async generateHash(password: string) {
    const salt = await bcrypt.genSalt(SALT);
    // console.log('salt', salt)
    return bcrypt.hash(password, salt);
  }

  async checkPassword({ password, hash }: { password: string; hash: string }) {
    return await bcrypt.compare(password, hash);
  }
}
