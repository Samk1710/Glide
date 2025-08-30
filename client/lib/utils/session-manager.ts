import { PrivateKeyEncryption } from '../utils/encryption';
import AgentSession, { IAgentSession } from '../models/AgentSession';
import { dbConnect } from '../db';

export interface LocalStorageSession {
  sessionId: string;
  sessionPassword: string;
  agentAddress: string;
  chainId: number;
  expiresAt: number;
}

export class AgentSessionManager {
  private static readonly STORAGE_KEY = 'glide_agent_session';
  private static readonly SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

  /**
   * Store agent session in database and local storage
   */
  static async createSession(
    privateKey: string,
    agentAddress: string,
    userId: string,
    chainId: number = 43113,
    userAgent?: string,
    ip?: string
  ): Promise<{ sessionId: string; success: boolean }> {
    try {
      await dbConnect();

      // Generate security components
      const salt = PrivateKeyEncryption.generateSalt();
      const sessionId = PrivateKeyEncryption.generateSessionId();
      
      // Encrypt private key
      const { encryptedData, sessionPassword } = PrivateKeyEncryption.encryptPrivateKey(privateKey, salt);

      // Prepare metadata
      const metadata = {
        userAgent,
        ipHash: ip ? PrivateKeyEncryption.hashIP(ip) : undefined,
        deviceFingerprint: userAgent ? PrivateKeyEncryption.generateDeviceFingerprint(userAgent) : undefined
      };

      // Deactivate any existing sessions for this user
      await AgentSession.updateMany(
        { userId, isActive: true },
        { 
          $set: { 
            isActive: false,
            lastActiveAt: new Date()
          }
        }
      );

      // Create new session in database
      const agentSession = new AgentSession({
        userId,
        agentAddress,
        saltedPrivateKey: encryptedData,
        salt,
        sessionId,
        chainId,
        metadata,
        isActive: true
      });

      await agentSession.save();

      // Store session info in local storage
      const localSession: LocalStorageSession = {
        sessionId,
        sessionPassword,
        agentAddress,
        chainId,
        expiresAt: Date.now() + this.SESSION_EXPIRY
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(localSession));
      }

      return { sessionId, success: true };
    } catch (error) {
      console.error('Failed to create agent session:', error);
      return { sessionId: '', success: false };
    }
  }

  /**
   * Retrieve agent session and decrypt private key
   */
  static async getSession(userId: string): Promise<{
    privateKey: string | null;
    agentAddress: string | null;
    chainId: number;
    sessionId: string | null;
  }> {
    try {
      await dbConnect();

      // Server-side: Get session directly from database
      if (typeof window === 'undefined') {
        const dbSession = await AgentSession.findOne({
          userId,
          isActive: true
        });

        if (!dbSession) {
          return { privateKey: null, agentAddress: null, chainId: 43113, sessionId: null };
        }

        // For server-side, we return the encrypted private key as-is since we can't decrypt without session password
        // The calling code should handle this appropriately
        return {
          privateKey: dbSession.saltedPrivateKey, // Note: This is encrypted on server-side
          agentAddress: dbSession.agentAddress,
          chainId: dbSession.chainId,
          sessionId: dbSession.sessionId
        };
      }

      // Client-side: Check localStorage first, then validate and decrypt
      const localSessionData = localStorage.getItem(this.STORAGE_KEY);
      if (!localSessionData) {
        return { privateKey: null, agentAddress: null, chainId: 43113, sessionId: null };
      }

      const localSession: LocalStorageSession = JSON.parse(localSessionData);

      // Check if session has expired
      if (Date.now() > localSession.expiresAt) {
        localStorage.removeItem(this.STORAGE_KEY);
        return { privateKey: null, agentAddress: null, chainId: 43113, sessionId: null };
      }

      // Find the session in database
      const dbSession = await AgentSession.findOne({
        sessionId: localSession.sessionId,
        userId,
        isActive: true
      });

      if (!dbSession) {
        // Clean up invalid local storage
        localStorage.removeItem(this.STORAGE_KEY);
        return { privateKey: null, agentAddress: null, chainId: 43113, sessionId: null };
      }

      // Decrypt private key
      const privateKey = PrivateKeyEncryption.decryptPrivateKey(
        dbSession.saltedPrivateKey,
        dbSession.salt,
        localSession.sessionPassword
      );

      // Update last active timestamp
      await AgentSession.updateOne(
        { _id: dbSession._id },
        { $set: { lastActiveAt: new Date() } }
      );

      return {
        privateKey,
        agentAddress: localSession.agentAddress,
        chainId: localSession.chainId,
        sessionId: localSession.sessionId
      };
    } catch (error) {
      console.error('Failed to retrieve agent session:', error);
      return { privateKey: null, agentAddress: null, chainId: 43113, sessionId: null };
    }
  }

  /**
   * Clear current session
   */
  static async clearSession(userId?: string, sessionId?: string): Promise<boolean> {
    try {
      if (typeof window !== 'undefined') {
        const localSessionData = localStorage.getItem(this.STORAGE_KEY);
        if (localSessionData) {
          const localSession: LocalStorageSession = JSON.parse(localSessionData);
          sessionId = sessionId || localSession.sessionId;
        }
        localStorage.removeItem(this.STORAGE_KEY);
      }

      if (sessionId) {
        await dbConnect();
        await AgentSession.updateOne(
          { sessionId, ...(userId && { userId }) },
          { 
            $set: { 
              isActive: false,
              lastActiveAt: new Date()
            }
          }
        );
      }

      return true;
    } catch (error) {
      console.error('Failed to clear agent session:', error);
      return false;
    }
  }

  /**
   * Check if user has an active session
   */
  static async hasActiveSession(userId: string): Promise<boolean> {
    try {
      await dbConnect();

      // Server-side: Check database directly
      if (typeof window === 'undefined') {
        const dbSession = await AgentSession.findOne({
          userId,
          isActive: true
        });
        return !!dbSession;
      }

      // Client-side: Check localStorage first, then validate against database
      const localSessionData = localStorage.getItem(this.STORAGE_KEY);
      if (!localSessionData) return false;

      const localSession: LocalStorageSession = JSON.parse(localSessionData);
      if (Date.now() > localSession.expiresAt) {
        localStorage.removeItem(this.STORAGE_KEY);
        return false;
      }

      const dbSession = await AgentSession.findOne({
        sessionId: localSession.sessionId,
        userId,
        isActive: true
      });

      return !!dbSession;
    } catch (error) {
      console.error('Failed to check active session:', error);
      return false;
    }
  }

  /**
   * Extend session expiry
   */
  static extendSession(): boolean {
    try {
      if (typeof window === 'undefined') return false;

      const localSessionData = localStorage.getItem(this.STORAGE_KEY);
      if (!localSessionData) return false;

      const localSession: LocalStorageSession = JSON.parse(localSessionData);
      localSession.expiresAt = Date.now() + this.SESSION_EXPIRY;

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(localSession));
      return true;
    } catch (error) {
      console.error('Failed to extend session:', error);
      return false;
    }
  }

  /**
   * Get all active sessions for user (admin function)
   */
  static async getUserSessions(userId: string): Promise<IAgentSession[]> {
    try {
      await dbConnect();
      return await AgentSession.find({ 
        userId, 
        isActive: true 
      }).sort({ lastActiveAt: -1 });
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      return [];
    }
  }

  /**
   * Clean up expired sessions (maintenance function)
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      await dbConnect();
      const expiredDate = new Date(Date.now() - this.SESSION_EXPIRY);
      
      const result = await AgentSession.updateMany(
        { 
          lastActiveAt: { $lt: expiredDate },
          isActive: true 
        },
        { 
          $set: { 
            isActive: false,
            lastActiveAt: new Date()
          }
        }
      );

      return result.modifiedCount;
    } catch (error) {
      console.error('Failed to cleanup expired sessions:', error);
      return 0;
    }
  }
}

export default AgentSessionManager;
