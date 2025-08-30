import 'server-only';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage } from 'telegram/events';
import { Api } from 'telegram/tl';
import AirdropModel from '@/lib/models/Airdrop';
import { dbConnect } from '@/lib/db';
import { AirdropZ } from '@/types/airdrop';
import { extractJSONArray } from '@/lib/utils/json';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface TelegramConfig {
  apiId: number;
  apiHash: string;
  phoneNumber: string;
  stringSession?: string;
}

export interface MonitoredChannel {
  id: string;
  title: string;
  username?: string;
  isActive: boolean;
}

export interface AirdropSignal {
  id: string;
  channelId: string;
  channelTitle: string;
  message: string;
  date: Date;
  projectName?: string;
  chains?: string[];
  keywords: string[];
  confidence: number;
  rawData: any;
}

class TelegramAirdropMonitor {
  private client?: TelegramClient;
  private isConnected = false;
  private monitoredChannels: MonitoredChannel[] = [];
  private signals: AirdropSignal[] = [];
  private genAI: GoogleGenerativeAI;
  
  // Common airdrop-related keywords and patterns
  private airdropKeywords = [
    'airdrop', 'testnet', 'mainnet', 'token launch', 'TGE', 'IDO', 'IEO',
    'points', 'retroactive', 'incentive', 'reward', 'farming', 'mining',
    'whitelist', 'allowlist', 'presale', 'early access', 'beta',
    'quest', 'task', 'bridge', 'swap', 'stake', 'LP', 'liquidity',
    'NFT', 'mint', 'claim', 'snapshot', 'allocation', 'distribution'
  ];

  private chainKeywords = [
    'ethereum', 'eth', 'bitcoin', 'btc', 'solana', 'sol', 'polygon', 'matic',
    'arbitrum', 'arb', 'optimism', 'op', 'base', 'avalanche', 'avax', 'fuji',
    'fantom', 'ftm', 'bsc', 'binance', 'bnb', 'cosmos', 'atom',
    'polkadot', 'dot', 'kusama', 'near', 'algorand', 'algo',
    'cardano', 'ada', 'tezos', 'xtz', 'zilliqa', 'zil'
  ];

  constructor(config: TelegramConfig) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required for AI analysis');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.setupTelegramClient(config);
  }

  /**
   * Set up Telegram client
   */
  private setupTelegramClient(config: TelegramConfig): void {
    const session = new StringSession(config.stringSession || '');
    
    this.client = new TelegramClient(session, config.apiId, config.apiHash, {
      connectionRetries: 5,
    });
  }

  /**
   * Connect to Telegram
   */
  async connect(phoneNumber: string, phoneCode?: string): Promise<{ success: boolean; needsCode?: boolean; session?: string }> {
    if (!this.client) {
      throw new Error('Telegram client not initialized');
    }

    try {
      await this.client.start({
        phoneNumber: async () => phoneNumber,
        phoneCode: async () => {
          if (!phoneCode) {
            return Promise.reject(new Error('Phone code required'));
          }
          return phoneCode;
        },
        onError: (err: any) => {
          console.error('Telegram auth error:', err);
          throw err;
        },
      });

      this.isConnected = true;
      
      // Set up message handler
      this.client.addEventHandler(this.handleNewMessage.bind(this), new NewMessage());

      const session = this.client.session.save?.();
      
      console.log('Successfully connected to Telegram');
      return { success: true, session: typeof session === 'string' ? session : undefined };

    } catch (error) {
      console.error('Failed to connect to Telegram:', error);
      
      if (error instanceof Error && error.message.includes('phone code')) {
        return { success: false, needsCode: true };
      }
      
      throw error;
    }
  }

  /**
   * Add a channel to monitor
   */
  async addChannelToMonitor(channelUsername: string): Promise<MonitoredChannel> {
    if (!this.client || !this.isConnected) {
      throw new Error('Telegram client not connected');
    }

    try {
      // Resolve the channel
      const result = await this.client.invoke(
        new Api.contacts.ResolveUsername({ username: channelUsername.replace('@', '') })
      );

      if (result.chats.length === 0) {
        throw new Error('Channel not found');
      }

      const chat = result.chats[0];
      
      const channel: MonitoredChannel = {
        id: chat.id.toString(),
        title: 'title' in chat ? chat.title : channelUsername,
        username: channelUsername,
        isActive: true
      };

      // Join the channel if needed
      try {
        await this.client.invoke(
          new Api.channels.JoinChannel({ channel: channelUsername })
        );
      } catch (error) {
        console.log('Already joined or public channel:', error);
      }

      this.monitoredChannels.push(channel);
      console.log(`Added channel to monitor: ${channel.title}`);

      return channel;

    } catch (error) {
      console.error('Failed to add channel:', error);
      throw error;
    }
  }

  /**
   * Handle new messages from monitored channels
   */
  private async handleNewMessage(event: any): Promise<void> {
    try {
      const message = event.message;
      if (!message || !message.peerId) return;

      const channelId = message.peerId.channelId?.toString();
      if (!channelId) return;

      // Check if this is from a monitored channel
      const monitoredChannel = this.monitoredChannels.find(ch => ch.id === channelId);
      if (!monitoredChannel) return;

      const messageText = message.message || '';
      if (messageText.length < 10) return; // Skip short messages

      // Check if message contains airdrop-related keywords
      const keywords = this.extractKeywords(messageText);
      if (keywords.length === 0) return;

      const confidence = this.calculateConfidence(messageText, keywords);
      if (confidence < 0.3) return; // Skip low-confidence messages

      // Create airdrop signal
      const signal: AirdropSignal = {
        id: `${channelId}_${message.id}`,
        channelId,
        channelTitle: monitoredChannel.title,
        message: messageText,
        date: new Date(message.date * 1000),
        keywords,
        confidence,
        rawData: message
      };

      // Extract project info using AI
      await this.enhanceSignalWithAI(signal);

      this.signals.push(signal);
      console.log(`New airdrop signal detected: ${signal.projectName || 'Unknown'} (${confidence.toFixed(2)})`);

      // Try to create a structured airdrop entry
      await this.processSignalToAirdrop(signal);

    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  /**
   * Extract relevant keywords from message
   */
  private extractKeywords(text: string): string[] {
    const lowerText = text.toLowerCase();
    const foundKeywords: string[] = [];

    // Check for airdrop keywords
    for (const keyword of this.airdropKeywords) {
      if (lowerText.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    }

    // Check for chain keywords
    for (const chain of this.chainKeywords) {
      if (lowerText.includes(chain)) {
        foundKeywords.push(chain);
      }
    }

    return [...new Set(foundKeywords)]; // Remove duplicates
  }

  /**
   * Calculate confidence score for airdrop relevance
   */
  private calculateConfidence(text: string, keywords: string[]): number {
    let score = 0;
    
    // Base score from keyword count
    score += keywords.length * 0.1;
    
    // Bonus for high-value keywords
    const highValueKeywords = ['airdrop', 'testnet', 'mainnet', 'retroactive', 'points'];
    for (const keyword of highValueKeywords) {
      if (keywords.includes(keyword)) {
        score += 0.2;
      }
    }

    // Bonus for URLs (often contains important links)
    if (text.includes('http')) score += 0.1;
    
    // Bonus for specific action words
    const actionWords = ['join', 'follow', 'connect', 'mint', 'stake', 'swap', 'bridge'];
    for (const action of actionWords) {
      if (text.toLowerCase().includes(action)) {
        score += 0.05;
      }
    }

    // Penalty for promotional spam keywords
    const spamKeywords = ['pump', 'moon', '🚀', 'lambo'];
    for (const spam of spamKeywords) {
      if (text.toLowerCase().includes(spam)) {
        score -= 0.1;
      }
    }

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Enhance signal with AI analysis
   */
  private async enhanceSignalWithAI(signal: AirdropSignal): Promise<void> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
        Analyze this Telegram message for airdrop/crypto project information:

        "${signal.message}"

        Extract the following information in JSON format:
        {
          "projectName": "string or null",
          "chains": ["array of blockchain names mentioned"] or null,
          "category": "string (DeFi, Gaming, Infrastructure, etc.)" or null,
          "isLegitimate": boolean,
          "actionRequired": "string description" or null,
          "websites": ["array of URLs mentioned"] or null
        }

        Only respond with valid JSON, no additional text.
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      try {
        const analysis = JSON.parse(responseText);
        
        signal.projectName = analysis.projectName;
        signal.chains = analysis.chains;
        
        // Store additional AI insights in rawData
        signal.rawData.aiAnalysis = analysis;
        
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
      }

    } catch (error) {
      console.error('AI analysis failed:', error);
    }
  }

  /**
   * Process signal into structured airdrop data
   */
  private async processSignalToAirdrop(signal: AirdropSignal): Promise<void> {
    if (!signal.projectName || signal.confidence < 0.7) return;

    try {
      await dbConnect();

      // Check if we already have this project
      const existingAirdrop = await AirdropModel.findOne({
        $or: [
          { name: signal.projectName },
          { slug: signal.projectName.toLowerCase().replace(/\s+/g, '-') }
        ]
      });

      if (existingAirdrop) {
        // Update with new information
        if (signal.rawData.aiAnalysis?.websites) {
          existingAirdrop.links = {
            ...existingAirdrop.links,
            website: signal.rawData.aiAnalysis.websites[0]
          };
        }
        
        // Add this Telegram message as a source
        const telegramSource = {
          handle: `@${signal.channelTitle}`,
          url: `https://t.me/${signal.channelTitle.replace('@', '')}`,
          tweet_id: signal.id,
          posted_at: signal.date.toISOString()
        };

        if (!existingAirdrop.sources.twitter_threads.find((s: any) => s.tweet_id === signal.id)) {
          existingAirdrop.sources.twitter_threads.push(telegramSource);
        }

        await existingAirdrop.save();
        console.log(`Updated existing airdrop: ${signal.projectName}`);
        
      } else {
        // Create new airdrop entry with Telegram data
        const airdropData = this.createAirdropFromSignal(signal);
        
        const validationResult = AirdropZ.safeParse(airdropData);
        if (validationResult.success) {
          const newAirdrop = new AirdropModel(validationResult.data);
          await newAirdrop.save();
          console.log(`Created new airdrop: ${signal.projectName}`);
        } else {
          console.error('Invalid airdrop data:', validationResult.error);
        }
      }

    } catch (error) {
      console.error('Failed to process signal to airdrop:', error);
    }
  }

  /**
   * Create airdrop structure from Telegram signal
   */
  private createAirdropFromSignal(signal: AirdropSignal): any {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    return {
      slug: signal.projectName!.toLowerCase().replace(/\s+/g, '-'),
      name: signal.projectName!,
      category: signal.rawData.aiAnalysis?.category || 'DeFi',
      primary_chain: signal.chains?.[0] || 'avalanche',
      chains: signal.chains || ['avalanche'],
      timeline: {
        rumor_window_start: now.toISOString(),
        rumor_window_end: futureDate.toISOString(),
        snapshot_hint: 'Monitor Telegram for updates'
      },
      links: {
        website: signal.rawData.aiAnalysis?.websites?.[0],
        docs: signal.rawData.aiAnalysis?.websites?.[1]
      },
      sources: {
        twitter_threads: [{
          handle: `@${signal.channelTitle}`,
          url: `https://t.me/${signal.channelTitle.replace('@', '')}`,
          tweet_id: signal.id,
          posted_at: signal.date.toISOString()
        }],
        evidence_level: signal.confidence > 0.8 ? 'strong' : 'rumor'
      },
      requirements: {
        onchain: {
          chains: signal.chains || ['avalanche'],
          min_transactions: 5,
          required_tx_types: ['transfer', 'swap']
        },
        offchain: {
          twitter_follow: [],
          discord_join: [],
          quests: [],
          kyc_required: false
        }
      },
      sybil_resistance: {
        heuristics: ['min_tx_count', 'unique_contracts'],
        disqualifiers: ['bot_behavior', 'sybil_cluster']
      },
      allocation: {
        token_ticker: signal.projectName!.toUpperCase().slice(0, 4),
        total_pool_tokens: 1000000,
        vesting: { cliff_days: 0, vesting_months: 6 },
        formula: 'Activity-based allocation',
        weights: { onchain_activity: 0.7, social: 0.2, loyalty_time: 0.1 }
      },
      estimates: {
        expected_value_usd_range: [10, 500],
        probability: signal.confidence > 0.8 ? 'high' : 'medium',
        notes: `Discovered via Telegram monitoring: ${signal.channelTitle}`
      },
      gas_breakdown: [
        { chain: 'avalanche', action: 'swap', est_gas_native: 0.01, est_gas_usd: 0.50 }
      ],
      ai_synthesized_demo: false
    };
  }

  /**
   * Get recent signals
   */
  getRecentSignals(limit: number = 50): AirdropSignal[] {
    return this.signals
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  /**
   * Get monitored channels
   */
  getMonitoredChannels(): MonitoredChannel[] {
    return this.monitoredChannels;
  }

  /**
   * Stop monitoring
   */
  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
      console.log('Disconnected from Telegram');
    }
  }
}

export { TelegramAirdropMonitor };
