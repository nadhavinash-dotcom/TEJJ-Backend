import { Twilio } from 'twilio';
import { OTPProvider, DevOTPProvider, OTPService } from './otpService';

export class TwilioProvider implements OTPProvider {
  private client: Twilio | null = null;
  private serviceSid: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID || '';

    if (!accountSid || !accountSid.startsWith('AC') || !authToken || !this.serviceSid) {
      console.warn('Twilio credentials missing or invalid. OTP service will only work for dev fixed numbers.');
    } else {
      this.client = new Twilio(accountSid, authToken);
    }
  }

  async sendOTP(phoneNumber: string): Promise<boolean> {
    if (!this.client || !this.serviceSid) {
      console.error('Twilio client not initialized. Cannot send OTP.');
      return false;
    }
    try {
      // Ensure phone number is in E.164 format
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      const verification = await this.client.verify.v2
        .services(this.serviceSid)
        .verifications.create({ to: formattedPhone, channel: 'sms' });

      return verification.status === 'pending';
    } catch (error) {
      console.error('Twilio Send OTP Error:', error);
      return false;
    }
  }

  async verifyOTP(phoneNumber: string, code: string): Promise<boolean> {
    if (!this.client || !this.serviceSid) {
      console.error('Twilio client not initialized. Cannot verify OTP.');
      return false;
    }
    try {
      console.log('Verifying OTP for', phoneNumber, code);
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

      const verificationCheck = await this.client.verify.v2
        .services(this.serviceSid)
        .verificationChecks.create({ to: formattedPhone, code });

      return verificationCheck.status === 'approved';
    } catch (error) {
      console.error('Twilio Verify OTP Error:', error);
      return false;
    }
  }
}

// Lazy wrapper to avoid instantiating Twilio until actually needed
class LazyTwilioProvider implements OTPProvider {
  private instance: TwilioProvider | null = null;

  async sendOTP(phoneNumber: string): Promise<boolean> {
    if (!this.instance) this.instance = new TwilioProvider();
    return this.instance.sendOTP(phoneNumber);
  }

  async verifyOTP(phoneNumber: string, code: string): Promise<boolean> {
    if (!this.instance) this.instance = new TwilioProvider();
    return this.instance.verifyOTP(phoneNumber, code);
  }
}

// Export a singleton instance wrapped with DevOTPProvider for development support
export const twilioProvider = new DevOTPProvider(new LazyTwilioProvider());
export const otpService = new OTPService(twilioProvider);
