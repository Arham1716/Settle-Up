import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: Transporter | null = null;

  async onModuleInit() {
    try {
      const oAuth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground',
      );

      oAuth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      });

      const accessTokenResponse = await oAuth2Client.getAccessToken();
      const accessToken = accessTokenResponse?.token;

      if (!accessToken) {
        throw new Error('Failed to get Gmail access token');
      }

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.GMAIL_USER!, // must match refresh token owner
          clientId: process.env.GMAIL_CLIENT_ID!,
          clientSecret: process.env.GMAIL_CLIENT_SECRET!,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN!,
          accessToken,
        },
      });
      console.log('Mail transporter created:', !!this.transporter);

      // Optional but recommended: verify connection
      await this.transporter.verify();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('MAIL INIT FAILED:', error.message);
      } else {
        console.error('MAIL INIT FAILED:', error);
      }

      // Do NOT crash the app
      this.transporter = null;
    }
  }

  async sendGroupInviteEmail(
    email: string,
    groupName: string,
    inviteToken: string,
  ): Promise<void> {
    if (!this.transporter) {
      // Mail is optional infrastructure — fail gracefully
      throw new ServiceUnavailableException(
        'Email service temporarily unavailable',
      );
    }

    try {
      const templatePath = join(
        __dirname,
        'templates',
        'group-invite.html',
      );

      const html = readFileSync(templatePath, 'utf8')
        .replace('{{GROUP_NAME}}', groupName)
        .replace(
          '{{INVITE_URL}}',
          `${process.env.FRONTEND_URL}/invite/${inviteToken}`,
        );

      await this.transporter.sendMail({
        from: `"Expense Tracker" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `You’ve been invited to join "${groupName}"`,
        html,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('MAIL SEND ERROR:', error.message);
      } else {
        console.error('MAIL SEND ERROR:', error);
      }

      throw new InternalServerErrorException(
        'Failed to send invitation email',
      );
    }
  }

  async sendSupportEmail(
    to: string,
    subject: string,
    message: string,
  ): Promise<void> {
    if (!this.transporter) {
      throw new ServiceUnavailableException(
        'Email service temporarily unavailable',
      );
    }

    try {
      await this.transporter.sendMail({
        from: `"Expense Tracker Support" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text: message,
        html: `<pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${message}</pre>`,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('MAIL SEND ERROR:', error.message);
      } else {
        console.error('MAIL SEND ERROR:', error);
      }

      throw new InternalServerErrorException('Failed to send support email');
    }
  }

  // NEW — Password reset email
  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    if (!this.transporter) {
      throw new ServiceUnavailableException(
        'Email service temporarily unavailable',
      );
    }

    try {
      const templatePath = join(__dirname, 'templates', 'password-reset.html');
      let html = readFileSync(templatePath, 'utf8');

      html = html.replace('{{RESET_URL}}', resetUrl);

      await this.transporter.sendMail({
        from: `"SettleUp Support" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Reset your Settle-Up password',
        html,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('MAIL SEND ERROR:', error.message);
      } else {
        console.error('MAIL SEND ERROR:', error);
      }
      throw new InternalServerErrorException('Failed to send password reset email');
    }
  }
}
