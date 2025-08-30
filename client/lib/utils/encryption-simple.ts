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
   * Encrypt private key with salt - simplified version
   */
  static encryptPrivateKey(privateKey: string, salt: string): {
    encryptedData: string;
    sessionPassword: string;
  } {
    try {
      // Generate a session password for this encryption
      const sessionPassword = crypto.randomBytes(32).toString('hex');
      
      // Create encryption key by combining session password and salt
      const key = crypto
        .createHash('sha256')
        .update(sessionPassword + salt)
        .digest();
      
      // Generate IV
      const iv = crypto.randomBytes(this.IV_LENGTH);
      
      // Create cipher
      const cipher = crypto.createCipher(this.ALGORITHM, key);
      
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
   * Decrypt private key - simplified version
   */
  static decryptPrivateKey(encryptedData: string, salt: string, sessionPassword: string): string {
    try {
      // Extract IV and encrypted data
      const iv = Buffer.from(encryptedData.slice(0, this.IV_LENGTH * 2), 'hex');
      const encrypted = encryptedData.slice(this.IV_LENGTH * 2);
      
      // Recreate encryption key
      const key = crypto
        .createHash('sha256')
        .update(sessionPassword + salt)
        .digest();
      
      // Create decipher
      const decipher = crypto.createDecipher(this.ALGORITHM, key);
      
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
