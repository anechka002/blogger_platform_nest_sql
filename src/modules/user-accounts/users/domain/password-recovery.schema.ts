import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  _id: false,
})
export class PasswordRecovery {
  @Prop({ type: String, nullable: true })
  recoveryCode: string | null;

  @Prop({ type: Date, nullable: true })
  expirationDate: Date | null;
}
export const PasswordRecoverySchema =
  SchemaFactory.createForClass(PasswordRecovery);
