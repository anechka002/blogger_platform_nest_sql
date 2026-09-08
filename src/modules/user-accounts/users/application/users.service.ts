import { Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { BcryptService } from './bcrypt.service';
import { Types } from 'mongoose';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { EmailService } from '../../../notifications/email.service';
import { randomUUID } from 'node:crypto';
import { addHours } from 'date-fns';
import { NewPasswordRecoveryDto } from '../dto/new-password-recovery.dto';

@Injectable()
export class UsersService {
  //инжектирование модели через DI
  constructor(
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
    private emailService: EmailService,
  ) {}

  // Регистрация пользователя
  async registerUser(dto: CreateUserDto) {
    const { login, email, password } = dto;

    const userByEmail = await this.usersRepository.findByEmail(email);
    if (userByEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already exists',
        extensions: [
          {
            message: 'Email should be unique',
            key: 'email',
          },
        ],
      });
    }

    const userByLogin = await this.usersRepository.findByLogin(login);
    if (userByLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Login already exists',
        extensions: [
          {
            message: 'Login should be unique',
            key: 'login',
          },
        ],
      });
    }

    const passwordHash: string =
      await this.bcryptService.generateHash(password);

    const createdUser = await this.usersRepository.create({
      login,
      email,
      passwordHash,
    });

    this.emailService
      .sendEmail(
        createdUser.email,
        'Registration confirmation',
        createdUser.emailConfirmation.confirmationCode,
      )
      .catch((error) =>
        console.log('Failed to send registration confirmation email', error),
      );
  }

  async passwordRecovery(email: string): Promise<void> {
    // нашли user по email
    const user = await this.usersRepository.findByEmail(email);
    // Если пользователя нет — просто молча выходим (как будто всё ок)
    if (!user) {
      return;
    }

    // Дополнительно проверяем, подтверждён ли email
    if (!user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.EmailNotConfirmed,
        message: 'Email is not confirmed',
        extensions: [{ message: 'Email is not confirmed', key: 'email' }],
      });
    }

    // создали recoveryCode
    const recoveryCode = randomUUID();
    // создали expirationDate
    const expirationDate = addHours(new Date(), 1);

    user.setPasswordRecovery(recoveryCode, expirationDate);

    await this.usersRepository.save(user);

    // отправили письмо со ссылкой
    this.emailService
      .sendEmail(user.email, 'Password recovery', recoveryCode)
      .catch((error) => console.log('error in send email', error));
  }

  async newPasswordRecovery({
    newPassword,
    recoveryCode,
  }: NewPasswordRecoveryDto): Promise<void> {
    const user = await this.usersRepository.findByRecoveryCode(recoveryCode);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Recovery code is incorrect',
        extensions: [
          { message: 'Recovery code is incorrect', key: 'recoveryCode' },
        ],
      });
    }

    if (
      !user.passwordRecovery.expirationDate ||
      user.passwordRecovery.expirationDate < new Date()
    ) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'Recovery code is expired',
        extensions: [
          { message: 'Recovery code is expired', key: 'recoveryCode' },
        ],
      });
    }

    const newPasswordHash = await this.bcryptService.generateHash(newPassword);

    user.completePasswordRecovery(newPasswordHash);

    await this.usersRepository.save(user);
  }

  // Повторно отправляет письмо для подтверждения регистрации
  async registrationEmailResending(email: string): Promise<void> {
    const user = await this.usersRepository.findByEmail(email);

    // Если user не найден → 400
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email is not registered',
        extensions: [{ message: 'Email is not registered', key: 'email' }],
      });
    }

    // Если user уже подтверждён → 400
    if (user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already confirmed',
        extensions: [{ message: 'Email is already confirmed', key: 'email' }],
      });
    }

    // Генерируем новый confirmationCode
    const newConfirmationCode = randomUUID();

    // Генерируем новую expirationDate
    const newExpirationDate = addHours(new Date(), 1);

    // Обновляем код подтверждения и срок его действия у найденного пользователя в памяти
    user.refreshEmailConfirmation(newConfirmationCode, newExpirationDate);

    // Сохраняем обновлённый confirmationCode и новую expirationDate в MongoDB
    await this.usersRepository.save(user);

    // Отправляем новое письмо
    this.emailService
      .sendEmail(user.email, 'Registration confirmation', newConfirmationCode)
      .catch((error) =>
        console.log('Failed to send registration confirmation email', error),
      );
  }

  // Подтверждает регистрацию пользователя по коду подтверждения
  async confirmCode(code: string): Promise<void> {
    const user = await this.usersRepository.findByConfirmationCode(code);

    // код не найден → 400
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Invalid confirmation code',
        extensions: [
          { message: 'Confirmation code is incorrect', key: 'code' },
        ],
      });
    }

    // email уже подтверждён → 400
    if (user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email is already confirmed',
        extensions: [{ message: 'Email is already confirmed', key: 'email' }],
      });
    }

    // код истёк → 400
    if (
      !user.emailConfirmation.expirationDate ||
      user.emailConfirmation.expirationDate < new Date()
    ) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeExpired,
        message: 'Confirmation code is expired',
        extensions: [{ message: 'Confirmation code is expired', key: 'code' }],
      });
    }

    // После успешных проверок меняем состояние пользователя
    user.confirmEmail();

    // сохраняем изменения в MongoDB
    await this.usersRepository.save(user);
  }

  async createUser(dto: CreateUserDto): Promise<string> {
    const { login, email, password } = dto;

    const userWithEmail = await this.usersRepository.findByEmail(email);
    if (userWithEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already exists',
        extensions: [
          {
            message: 'The email address is not unique',
            key: 'email',
          },
        ],
      });
    }

    const passwordHash: string =
      await this.bcryptService.generateHash(password);

    const user = User.createInstance({ login, email, passwordHash });
    const savedUser = await this.usersRepository.create(user);
    return savedUser._id.toString();
  }

  async deleteUser(id: Types.ObjectId) {
    const user = await this.usersRepository.findOrNotFoundFail(id);

    user.makeDeleted();

    await this.usersRepository.save(user);
  }
}
