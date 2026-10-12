export class CreateSessionDomainDto {
  deviceId: string;
  userId: string;
  deviceName: string;
  ip: string;
  // Когда был выпущен текущий refresh token
  issuedAt: Date;
  // Когда текущая session должна протухнуть
  expirationDate: Date;
}
