import mongoose, { Schema, Document } from 'mongoose';

export interface IAgentSession extends Document {
  userId: string;
  agentAddress: string;
  saltedPrivateKey: string; // Encrypted private key with salt
  salt: string; // Salt used for encryption
  sessionId: string; // Unique session identifier
  chainId: number;
  createdAt: Date;
  lastActiveAt: Date;
  isActive: boolean;
  metadata: {
    userAgent?: string;
    ipHash?: string; // Hashed IP for security
    deviceFingerprint?: string;
  };
}

const AgentSessionSchema = new Schema<IAgentSession>({
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  agentAddress: { 
    type: String, 
    required: true,
    unique: true,
    index: true 
  },
  saltedPrivateKey: { 
    type: String, 
    required: true 
  },
  salt: { 
    type: String, 
    required: true 
  },
  sessionId: { 
    type: String, 
    required: true,
    unique: true,
    index: true 
  },
  chainId: { 
    type: Number, 
    required: true,
    default: 43113 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastActiveAt: { 
    type: Date, 
    default: Date.now 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  metadata: {
    userAgent: String,
    ipHash: String,
    deviceFingerprint: String
  }
}, { 
  timestamps: true,
  collection: 'agentSessions'
});

// Indexes for performance
AgentSessionSchema.index({ userId: 1, isActive: 1 });
AgentSessionSchema.index({ sessionId: 1, isActive: 1 });
AgentSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export default (mongoose.models.AgentSession as mongoose.Model<IAgentSession>) || 
               mongoose.model<IAgentSession>('AgentSession', AgentSessionSchema);
