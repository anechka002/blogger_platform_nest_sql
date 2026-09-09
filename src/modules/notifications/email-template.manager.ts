import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailTemplateManager {
  getRegistrationConfirmationTemplate(code: string | null): string {
    const confirmationLink = `https://some-front.com/confirm-registration?code=${code}`;

    return `
      <h1>Thank for your registration</h1>
      <p>
        To finish registration please follow the link below:
        <a href="${confirmationLink}">complete registration</a>
      </p>
    `;
  }

  getPasswordRecoveryTemplate(recoveryCode: string | null): string {
    return `<h1>Password recovery</h1>
       <p>To finish password recovery, please follow the link below:</p>
       <p>Your recovery code:</p>
       <p>${recoveryCode}</p>
       <a href="https://some-front.com/password-recovery?recoveryCode=${recoveryCode}">
        Recover password
      </a>`;
  }
}
