import crypto from 'crypto';

export class PrivateKeyEncryption {
  private static readonly ALGORITHM = 'aes-256-cbc';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;

  /**
   * Generate a cryptographically secure salt
   */
  static generateSalt(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate session ID
   */
  static generateSessionId(): string {
    return crypto.randomBytes(16).toString('hex') + Date.now().toString(36);
  }

  /**
   * Encrypt private key with salt - working implementation
   */
  static encryptPrivateKey(privateKey: string, salt: string): {
    encryptedData: string;
    sessionPassword: string;
  } {
    try {
      // Generate a session password for this encryption
      const sessionPassword = crypto.randomBytes(32).toString('hex');
      
      // Generate a key from password and salt
      const key = crypto.pbkdf2Sync(sessionPassword, salt, 10000, 32, 'sha256');
      
      // Generate IV
      const iv = crypto.randomBytes(16);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
      
      // Encrypt
      let encrypted = cipher.update(privateKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Combine IV + encrypted data
      const result = iv.toString('hex') + encrypted;
      
      return {
        encryptedData: result,
        sessionPassword
      };
    } catch (error) {
      throw new Error(`Failed to encrypt private key: ${error}`);
    }
  }

  /**
   * Decrypt private key - working implementation
   */
  static decryptPrivateKey(encryptedData: string, salt: string, sessionPassword: string): string {
    try {
      // Extract IV and encrypted data
      const iv = Buffer.from(encryptedData.slice(0, 32), 'hex');
      const encrypted = encryptedData.slice(32);
      
      // Regenerate key from password and salt
      const key = crypto.pbkdf2Sync(sessionPassword, salt, 10000, 32, 'sha256');
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      
      // Decrypt
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Failed to decrypt private key: ${error}`);
    }
  }

  /**
   * Hash a value with SHA256
   */
  static hashValue(value: string, salt?: string): string {
    const input = salt ? value + salt : value;
    return crypto.createHash('sha256').update(input).digest('hex');
  }
}

/**
 * Generate device fingerprint from user agent
 */
export function generateDeviceFingerprint(userAgent: string): string {
  return crypto
    .createHash('sha256')
    .update(userAgent + Date.now().toString())
    .digest('hex')
    .substring(0, 16);
}

/**
 * Hash IP address for privacy
 */
export function hashIP(ipAddress: string): string {
  return crypto
    .createHash('sha256')
    .update(ipAddress + (process.env.IP_SALT || 'default-ip-salt'))
    .digest('hex')
    .substring(0, 16);
}

export default PrivateKeyEncryption;
