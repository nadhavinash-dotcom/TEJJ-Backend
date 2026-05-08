export interface OTPProvider {
  sendOTP(phoneNumber: string): Promise<boolean>;
  verifyOTP(phoneNumber: string, code: string): Promise<boolean>;
}

export class DevOTPProvider implements OTPProvider {
  private fixedNumbers: Record<string, string> = {
    '+916301863490': '000000',
    '+919999999901': '000000',
    '+919999999902': '000000',
    '+919999999903': '000000',
    '+918888897687': '000000',
    '+918888884607': '000000',
  };

  constructor(private baseProvider: OTPProvider) { }

  private getCleanPhone(phoneNumber: string): string {
    // Keep + if it's there, but remove all whitespace
    return phoneNumber.replace(/\s+/g, '');
  }

  private isDev(): boolean {
    return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  }

  async sendOTP(phoneNumber: string): Promise<boolean> {
    const cleanPhone = this.getCleanPhone(phoneNumber);
    
    if (this.isDev() && this.fixedNumbers[cleanPhone]) {
      console.log(`[DEV] Skipping Twilio for ${phoneNumber}, using fixed OTP`);
      return true;
    }
    return this.baseProvider.sendOTP(phoneNumber);
  }

  async verifyOTP(phoneNumber: string, code: string): Promise<boolean> {
    const cleanPhone = this.getCleanPhone(phoneNumber);
    
    if (this.isDev() && this.fixedNumbers[cleanPhone]) {
      const isValid = code === this.fixedNumbers[cleanPhone];
      console.log(`[DEV] Verifying fixed OTP for ${phoneNumber}: ${isValid ? 'SUCCESS' : 'FAILED'}`);
      return isValid;
    }
    return this.baseProvider.verifyOTP(phoneNumber, code);
  }
}

export class OTPService {
  private provider: OTPProvider;

  constructor(provider: OTPProvider) {
    this.provider = provider;
  }

  async send(phoneNumber: string): Promise<boolean> {
    return this.provider.sendOTP(phoneNumber);
  }

  async verify(phoneNumber: string, code: string): Promise<boolean> {
    return this.provider.verifyOTP(phoneNumber, code);
  }
}
