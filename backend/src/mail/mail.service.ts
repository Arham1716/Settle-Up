import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter!: nodemailer.Transporter;

  async onModuleInit() {
    try {
      const oAuth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground', // redirect URI
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
        service: 'gmail', // recommended over host/port for OAuth
        auth: {
          type: 'OAuth2',
          user: process.env.GMAIL_USER!, // MUST MATCH TOKEN OWNER
          clientId: process.env.GMAIL_CLIENT_ID!,
          clientSecret: process.env.GMAIL_CLIENT_SECRET!,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN!,
          accessToken,
        },
      });
    } catch (err) {
      console.error('Failed to initialize mail transporter:', err);
      throw new InternalServerErrorException(
        'Failed to initialize mail transporter',
      );
    }
  }

  async sendGroupInviteEmail(
    email: string,
    groupName: string,
    inviteToken: string,
  ): Promise<void> {
    try {
      const templatePath = join(__dirname, 'templates', 'group-invite.html');
      const html = readFileSync(templatePath, 'utf8')
        .replace('{{GROUP_NAME}}', groupName)
        .replace(
          '{{INVITE_URL}}',
          `${process.env.FRONTEND_URL}/invite/${inviteToken}`,
        );

      if (!this.transporter) {
        throw new InternalServerErrorException(
          'Mail transporter not initialized yet',
        );
      }

      await this.transporter.sendMail({
        from: `"Expense Tracker" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `You’ve been invited to join "${groupName}"`,
        html,
      });
    } catch (error) {
      console.error('MAIL ERROR:', error);
      throw new InternalServerErrorException('Failed to send invitation email');
    }
  }
}
