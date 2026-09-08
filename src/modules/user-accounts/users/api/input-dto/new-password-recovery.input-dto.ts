import { IsString } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-width-trim';
import { passwordConstraints } from '../../domain/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { NewPasswordRecoveryDto } from '../../dto/new-password-recovery.dto';

export class NewPasswordRecoveryInputDto implements NewPasswordRecoveryDto {
  @ApiProperty()
  @IsString()
  @IsStringWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  newPassword: string;

  @ApiProperty()
  @IsString()
  recoveryCode: string;
}
