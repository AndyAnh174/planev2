import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    // Initialize nodemailer transporter
    // For development, use SMTP or a service like SendGrid, SES, etc.
    const emailConfig = this.configService.get("email") || {};
    
    // Default to console transport for development (logs emails instead of sending)
    if (process.env.NODE_ENV === "production" && emailConfig.host) {
      this.transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port || 587,
        secure: emailConfig.secure || false,
        auth: emailConfig.auth || {
          user: emailConfig.user,
          pass: emailConfig.password,
        },
      });
    } else {
      // Development: Use console transport or ethereal email for testing
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: "test@ethereal.email",
          pass: "test",
        },
      });
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const frontendUrl = this.configService.get<string>("APP_URL") || "http://localhost:3000";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: this.configService.get<string>("EMAIL_FROM") || "noreply@planev2.com",
      to: email,
      subject: "Reset Your Password - PlaneV2.0",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <p style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 15 minutes. If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `,
      text: `
        Reset Your Password
        
        You requested to reset your password. Click the link below to set a new password:
        
        ${resetUrl}
        
        This link will expire in 15 minutes. If you didn't request a password reset, please ignore this email.
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      // Don't throw error to prevent exposing email existence
      // In production, you might want to log this differently
    }
  }

  /**
   * Send invitation email
   */
  async sendInvitationEmail(
    email: string,
    workspaceName: string,
    inviterName: string,
    invitationToken: string
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>("APP_URL") || "http://localhost:3000";
    const acceptUrl = `${frontendUrl}/invitations/${invitationToken}`;

    const mailOptions = {
      from: this.configService.get<string>("EMAIL_FROM") || "noreply@planev2.com",
      to: email,
      subject: `You've been invited to join ${workspaceName} - PlaneV2.0`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">You've been invited!</h2>
          <p><strong>${inviterName}</strong> has invited you to join the workspace <strong>${workspaceName}</strong>.</p>
          <p style="margin: 20px 0;">
            <a href="${acceptUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Accept Invitation
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${acceptUrl}</p>
        </div>
      `,
      text: `
        You've been invited!
        
        ${inviterName} has invited you to join the workspace ${workspaceName}.
        
        Accept your invitation: ${acceptUrl}
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Invitation email sent to ${email}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${email}:`, error);
      throw error;
    }
  }
}

