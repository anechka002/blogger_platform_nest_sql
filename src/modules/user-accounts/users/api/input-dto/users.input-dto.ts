//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
import { CreateUserDto } from '../../dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserInputDto implements CreateUserDto {
  @ApiProperty({ example: 'anna' })
  login: string;

  @ApiProperty()
  password: string;

  @ApiProperty({ example: 'example@example.dev' })
  email: string;
}
