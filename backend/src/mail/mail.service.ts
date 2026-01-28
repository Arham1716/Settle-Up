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
  private accessToken: string | null = null;
  private accessTokenExpiry: number = 0; // Unix timestamp in ms
  private oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground',
  );

  async onModuleInit() {
    console.log('MAIL INIT: Starting OAuth2 setup...');
    this.oAuth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    try {
      await this.getTransporter(); // initialize transporter at startup
      console.log('MAIL INIT: Transporter ready');
    } catch (err) {
      console.error('MAIL INIT FAILED:', err);
      this.transporter = null;
    }
  }

  // -------------------------
  // Ensure Access Token with retries
  // -------------------------
  private async ensureAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.accessToken && now < this.accessTokenExpiry - 60000) {
      // Token valid
      return this.accessToken;
    }

    const maxRetries = 5;
    let attempt = 0;
    let delay = 1000; // start with 1s

    while (attempt < maxRetries) {
      try {
        console.log(`MAIL: Fetching Gmail access token (attempt ${attempt + 1})...`);
        const res = await this.oAuth2Client.getAccessToken();
        const token = res?.token;
        const expiry = this.oAuth2Client.credentials.expiry_date;

        if (!token || !expiry) throw new Error('Failed to obtain Gmail access token');

        this.accessToken = token;
        this.accessTokenExpiry = expiry;
        console.log('MAIL: Access token obtained, expires at', new Date(expiry));
        return this.accessToken;
      } catch (err) {
        attempt++;
        console.warn(`MAIL: Failed to get access token (attempt ${attempt}):`, err);

        if (attempt >= maxRetries) {
          console.error('MAIL: All attempts to fetch access token failed');
          throw new ServiceUnavailableException('Email service temporarily unavailable');
        }

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // double delay each retry
      }
    }

    throw new ServiceUnavailableException('Email service temporarily unavailable');
  }

  // -------------------------
  // Get transporter
  // -------------------------
  private async getTransporter(): Promise<Transporter> {
    const token = await this.ensureAccessToken();

    // Recreate transporter if missing or expired
    if (!this.transporter) {
      console.log('MAIL: Creating transporter...');
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.GMAIL_USER!,
          clientId: process.env.GMAIL_CLIENT_ID!,
          clientSecret: process.env.GMAIL_CLIENT_SECRET!,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN!,
          accessToken: token,
        },
      });

      try {
        await this.transporter.verify();
        console.log('MAIL: Transporter verified');
      } catch (err) {
        console.error('MAIL: Transporter verification failed', err);
        this.transporter = null;
        throw new ServiceUnavailableException('Email service temporarily unavailable');
      }
    }

    return this.transporter;
  }

  // -------------------------
  // Send emails
  // -------------------------
  async sendGroupInviteEmail(email: string, groupName: string, inviteToken: string) {
    try {
      const transporter = await this.getTransporter();
      const html = readFileSync(join(__dirname, 'templates', 'group-invite.html'), 'utf8')
        .replace('{{GROUP_NAME}}', groupName)
        .replace('{{INVITE_URL}}', `${process.env.FRONTEND_URL}/invite/${inviteToken}`);

      await transporter.sendMail({
        from: `"Expense Tracker" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `You’ve been invited to join "${groupName}"`,
        html,
      });
    } catch (err) {
      console.error('MAIL SEND ERROR:', err);
      throw new InternalServerErrorException('Failed to send invitation email');
    }
  }

  async sendSupportEmail(to: string, subject: string, message: string) {
    try {
      const transporter = await this.getTransporter();
      await transporter.sendMail({
        from: `"Expense Tracker Support" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text: message,
        html: `<pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${message}</pre>`,
      });
    } catch (err) {
      console.error('MAIL SEND ERROR:', err);
      throw new InternalServerErrorException('Failed to send support email');
    }
  }

  async sendPasswordResetEmail(email: string, resetUrl: string) {
    try {
      const transporter = await this.getTransporter();
      const html = readFileSync(join(__dirname, 'templates', 'password-reset.html'), 'utf8')
        .replace('{{RESET_URL}}', resetUrl);

      await transporter.sendMail({
        from: `"SettleUp Support" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Reset your Settle-Up password',
        html,
      });
    } catch (err) {
      console.error('MAIL SEND ERROR:', err);
      throw new InternalServerErrorException('Failed to send password reset email');
    }
  }
}
