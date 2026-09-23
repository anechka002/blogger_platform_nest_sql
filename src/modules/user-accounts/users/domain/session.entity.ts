import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class SessionEntity {
  @Prop({ required: true, type: String })
  deviceId: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  deviceName: string;

  @Prop({ type: String, required: true })
  ip: string;

  // Когда был выпущен текущий refresh token
  @Prop({ type: Date, required: true })
  issuedAt: Date;

  // Когда текущая session должна протухнуть
  @Prop({ type: Date, required: true })
  expirationDate: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  // создаём session
  static createSession({
    deviceId,
    userId,
    deviceName,
    ip,
    issuedAt,
    expirationDate,
  }: {
    deviceId: string;
    userId: string;
    deviceName: string;
    ip: string;
    issuedAt: Date;
    expirationDate: Date;
  }): SessionEntity {
    const session = new this();

    session.deviceId = deviceId;
    session.userId = userId;
    session.deviceName = deviceName;
    session.ip = ip;
    session.issuedAt = issuedAt;
    session.expirationDate = expirationDate;
    session.deletedAt = null;

    return session;
  }

  makeDeleted() {
    // Если device уже был удалён, второй раз удалять его нельзя.
    if (this.deletedAt !== null) {
      throw new Error('Device is already deleted');
    }
    this.deletedAt = new Date();
  }

  updateRefreshToken({
    issuedAt,
    expirationDate,
  }: {
    issuedAt: Date;
    expirationDate: Date;
  }): void {
    this.issuedAt = issuedAt;
    this.expirationDate = expirationDate;
  }
}

export const SessionSchema = SchemaFactory.createForClass(SessionEntity);

//регистрирует методы сущности в схеме
SessionSchema.loadClass(SessionEntity);

//Типизация документа
export type SessionDocument = HydratedDocument<SessionEntity>;

export type SessionModelType = Model<SessionDocument> & typeof SessionEntity;
