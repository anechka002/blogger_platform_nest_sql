import { addHours } from 'date-fns';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  EmailConfirmation,
  EmailConfirmationSchema,
} from './email-confirmation.schema';
import {
  PasswordRecoverySchema,
  PasswordRecovery,
} from './password-recovery.schema';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import { randomUUID } from 'node:crypto';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, type: String, minlength: 1, maxlength: 100 })
  login: string;

  @Prop({
    type: String,
    unique: true,
    required: true,
    minlength: 5,
    maxlength: 200,
  })
  email: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: Date, required: true })
  createdAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: EmailConfirmationSchema, required: true })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: PasswordRecoverySchema, required: true })
  passwordRecovery: PasswordRecovery;

  // Проверяет, что login, email и passwordHash не пустые
  private static validateCreateParams({
    login,
    email,
    passwordHash,
  }: CreateUserDomainDto): void {
    if (!login.trim()) {
      throw new Error('Login cannot be empty');
    }

    if (!email.trim()) {
      throw new Error('Email cannot be empty');
    }

    if (!passwordHash.trim()) {
      throw new Error('Password hash is required');
    }
  }

  // создаём пользователя через POST /users
  static createInstance(dto: CreateUserDomainDto): User {
    this.validateCreateParams(dto);

    const user = new this();

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.createdAt = new Date();
    user.deletedAt = null;
    user.emailConfirmation = {
      confirmationCode: '',
      expirationDate: new Date(),
      isConfirmed: true,
    };
    user.passwordRecovery = {
      recoveryCode: null,
      expirationDate: null,
    };

    return user;
  }

  makeDeleted() {
    // Если пользователь уже был удалён, второй раз удалять его нельзя.
    if (this.deletedAt !== null) {
      throw new Error('User is already deleted');
    }
    this.deletedAt = new Date();
  }

  // Пользователь регистрируется самостоятельно через /auth/registration
  static createForRegistration(dto: CreateUserDomainDto): UserDocument {
    this.validateCreateParams(dto);

    const user = new this();

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.emailConfirmation = {
      confirmationCode: randomUUID(),
      expirationDate: addHours(new Date(), 1),
      isConfirmed: false,
    };
    user.passwordRecovery = {
      recoveryCode: null,
      expirationDate: null,
    };

    return user as UserDocument;
  }

  confirmEmail(): void {
    // Переводим пользователя в подтверждённое состояние
    this.emailConfirmation.isConfirmed = true;
    // Использованный код больше не должен применяться повторно
    this.emailConfirmation.confirmationCode = null;
  }

  refreshEmailConfirmation(
    newConfirmationCode: string,
    newExpirationDate: Date,
  ): void {
    // Обновляем код подтверждения и срок его действия в состоянии пользователя
    this.emailConfirmation.confirmationCode = newConfirmationCode;
    this.emailConfirmation.expirationDate = newExpirationDate;
  }

  setPasswordRecovery(recoveryCode: string, expirationDate: Date): string {
    // сохранили это в БД
    this.passwordRecovery.recoveryCode = recoveryCode;
    this.passwordRecovery.expirationDate = expirationDate;

    return recoveryCode;
  }

  completePasswordRecovery(newPasswordHash: string): void {
    // сохранили новый passwordHash
    this.passwordHash = newPasswordHash;

    // После успешной смены пароля код больше нельзя использовать повторно
    this.passwordRecovery.recoveryCode = null;
    this.passwordRecovery.expirationDate = null;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

//регистрирует методы сущности в схеме
UserSchema.loadClass(User);

//Типизация документа
export type UserDocument = HydratedDocument<User>;

export type UserModelType = Model<UserDocument> & typeof User;
