import crypto from 'crypto';
import { Action, ActionType, RedirectMethod } from '../types/payment/payment';

// Compact representation of redirect data
interface CompactRedirectData {
    u: string; // redirectUrl
    m?: string; // redirectMethod (optional, defaults to GET)
    d?: string; // data (JSON stringified, optional)
}

export class RedirectEncryptionUtil {
    private static readonly algorithm = 'aes-256-gcm';
    private static readonly secretKey = process.env.REDIRECT_ENCRYPTION_KEY || 'default-key-change-in-production';

    /**
     * Encrypts a redirect action into a base64 encoded blob
     */
    static encryptRedirectAction(action: Action): string {
        try {
            // Create compact representation
            const compactData: CompactRedirectData = {
                u: action.redirectUrl || '',
                m: action.redirectMethod || RedirectMethod.GET,
                d: action.data ? JSON.stringify(action.data) : undefined
            };

            const iv = crypto.randomBytes(16);
            const key = crypto.scryptSync(this.secretKey, 'salt', 32);
            const cipher = crypto.createCipheriv(this.algorithm, key, iv);
            cipher.setAAD(Buffer.from('redirect-action', 'utf8'));

            let encrypted = cipher.update(JSON.stringify(compactData), 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const authTag = cipher.getAuthTag();
            
            // Combine IV, authTag, and encrypted data
            const combined = Buffer.concat([
                iv,
                authTag,
                Buffer.from(encrypted, 'hex')
            ]);
            
            return combined.toString('base64');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to encrypt redirect action: ${errorMessage}`);
        }
    }

    /**
     * Decrypts a base64 encoded blob back to a redirect action
     */
    static decryptRedirectAction(encryptedBlob: string): Action {
        try {
            const combined = Buffer.from(encryptedBlob, 'base64');
            
            // Extract IV (first 16 bytes), authTag (next 16 bytes), and encrypted data
            const iv = combined.subarray(0, 16);
            const authTag = combined.subarray(16, 32);
            const encrypted = combined.subarray(32);
            
            const key = crypto.scryptSync(this.secretKey, 'salt', 32);
            const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
            decipher.setAAD(Buffer.from('redirect-action', 'utf8'));
            decipher.setAuthTag(authTag);
            
            let decrypted = decipher.update(encrypted, undefined, 'utf8');
            decrypted += decipher.final('utf8');
            
            const compactData: CompactRedirectData = JSON.parse(decrypted);
            
            // Reconstruct the Action object
            const action: Action = {
                actionType: ActionType.REDIRECT,
                redirectUrl: compactData.u,
                redirectMethod: compactData.m as RedirectMethod || RedirectMethod.GET,
                data: compactData.d ? JSON.parse(compactData.d) : undefined
            };
            
            return action;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to decrypt redirect action: ${errorMessage}`);
        }
    }
}
