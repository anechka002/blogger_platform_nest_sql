import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

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
