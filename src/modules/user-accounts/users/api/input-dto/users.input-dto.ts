//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
import { CreateUserDto } from '../../dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-width-trim';
import {
  emailConstraints,
  loginConstraints,
  passwordConstraints,
} from '../../domain/user.entity';

export class CreateUserInputDto implements CreateUserDto {
  @ApiProperty({ example: 'anna' })
  @IsString()
  @IsStringWithTrim(loginConstraints.minLength, loginConstraints.maxLength)
  readonly login: string;

  @ApiProperty()
  @IsString()
  @IsStringWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  readonly password: string;

  @ApiProperty({ example: 'example@example.dev' })
  @Matches(emailConstraints.match)
  @IsStringWithTrim(emailConstraints.minLength, emailConstraints.maxLength)
  readonly email: string;
}
