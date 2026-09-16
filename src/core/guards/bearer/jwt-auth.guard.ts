import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainExceptionCode } from '../../exceptions/domain-exception-codes';
import { DomainException } from '../../exceptions/domain-exceptions';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Переопределяем стандартный handleRequest из AuthGuard.
  // Вызывается автоматически после проверки JWT.
  // Нужен, чтобы вместо стандартной ошибки выбросить свою DomainException.
  handleRequest(err, user) {
    if (err || !user) {
      // здесь можно выбросить любую свою ошибку
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }
    return user;
  }
}

// Request с JWT
// ↓
// JwtAuthGuard
// ↓
// AuthGuard('jwt')
// ↓
// JWT strategy проверяет токен
// ↓
// Passport вызывает handleRequest(err, user)
// ↓
// если ошибка или user нет
// → DomainException Unauthorized
// → ExceptionFilter
// → 401
//
// если всё хорошо
// → return user
// → request.user
// → Controller
