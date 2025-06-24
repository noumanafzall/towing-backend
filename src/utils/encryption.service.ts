import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  // Generate a 32-byte key using PBKDF2
  private readonly key = crypto.pbkdf2Sync(
    'Movca2025SecretKeyForTaxInfoEncryption',
    'salt',
    100000, // number of iterations
    32, // key length in bytes
    'sha256'
  );

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Store the IV with the encrypted text
    return `${iv.toString('hex')}:${encrypted}`;
  }

  decrypt(text: string): string {
    try {
      const [ivHex, encryptedText] = text.split(':');
      if (!ivHex || !encryptedText) {
        throw new Error('Invalid encrypted text format');
      }
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return text; // Return original text if decryption fails
    }
  }
} 