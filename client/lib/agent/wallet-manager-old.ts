import 'server-only';
import { Agentkit } from "@0xgasless/agentkit";
import { ethers } from 'ethers';
import AgentSessionManager from '../utils/session-manager';

export interface AgentWalletConfig {
  privateKey?: `0x${string}`;
  rpcUrl: string;
  apiKey: string;
  chainId: number;
  userId: string;
}

export interface AgentWallet {
  address: string;
  privateKey: `0x${string}`;
  agentkit: any;
  chainId: number;
  sessionId?: string;
}

class AgentWalletManager {
  private static instance: AgentWalletManager;
  private agents = new Map<string, AgentWallet>();

  private constructor() {}

  static getInstance(): AgentWalletManager {
    if (!AgentWalletManager.instance) {
      AgentWalletManager.instance = new AgentWalletManager();
    }
    return AgentWalletManager.instance;
  }

  /**
   * Create a new agent wallet with a randomly generated private key and persist session
   */
  async createAgentWallet(config: Omit<AgentWalletConfig, 'privateKey'>): Promise<AgentWallet> {
    const wallet = ethers.Wallet.createRandom();
    const privateKey = wallet.privateKey as `0x${string}`;
    
    return this.initializeAgentWallet({
      ...config,
      privateKey
    });
  }

  /**
   * Import an existing agent wallet using a private key and persist session
   */
  async importAgentWallet(config: AgentWalletConfig): Promise<AgentWallet> {
    if (!config.privateKey) {
      throw new Error('Private key is required for importing wallet');
    }

    return this.initializeAgentWallet(config);
  }

  /**
   * Restore agent wallet from existing session
   */
  async restoreAgentWallet(userId: string): Promise<AgentWallet | null> {
    try {
      const session = await AgentSessionManager.getSession(userId);
      
      if (!session.privateKey || !session.agentAddress) {
        return null;
      }

      // Check if we already have this wallet in memory
      const existingWallet = this.agents.get(session.agentAddress);
      if (existingWallet) {
        return existingWallet;
      }

      // Restore the wallet configuration
      const config: AgentWalletConfig = {
        privateKey: session.privateKey as `0x${string}`,
        rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
        apiKey: process.env['0xGASLESS_API_KEY'] || '',
        chainId: session.chainId,
        userId
      };

      const agentWallet = await this.initializeAgentWallet(config, session.sessionId || undefined);
      
      console.log(`Agent wallet restored from session: ${session.agentAddress}`);
      return agentWallet;

    } catch (error) {
      console.error('Failed to restore agent wallet from session:', error);
      return null;
    }
  }
    }

    return this.initializeAgentWallet(config);
  }

  /**
   * Initialize agent wallet with 0xGasless integration
   */
  private async initializeAgentWallet(config: AgentWalletConfig): Promise<AgentWallet> {
    try {
      const { privateKey, rpcUrl, apiKey, chainId } = config;
      
      // Validate private key format
      if (!privateKey?.startsWith('0x') || privateKey.length !== 66) {
        throw new Error('Invalid private key format');
      }

      // Get wallet address from private key
      const wallet = new ethers.Wallet(privateKey);
      const address = wallet.address;

      // Configure 0xGasless Agentkit
      const agentkit = await Agentkit.configureWithWallet({
        privateKey,
        rpcUrl,
        apiKey,
        chainID: chainId,
      });

      // Set environment variables for the agent
      process.env["0xGASLESS_API_KEY"] = apiKey;
      process.env["0xGASLESS_CHAIN_ID"] = chainId.toString();
      process.env["0xGASLESS_PRIVATE_KEY"] = privateKey;
      process.env["0xGASLESS_RPC_URL"] = rpcUrl;
      process.env["PRIVATE_KEY"] = privateKey;
      process.env["RPC_URL"] = rpcUrl;
      process.env["CHAIN_ID"] = chainId.toString();
      process.env["USE_EOA"] = "true";

      const agentWallet: AgentWallet = {
        address,
        privateKey,
        agentkit,
        chainId
      };

      // Store the agent wallet
      this.agents.set(address, agentWallet);

      console.log(`Agent wallet initialized: ${address} on chain ${chainId}`);
      return agentWallet;

    } catch (error) {
      console.error('Failed to initialize agent wallet:', error);
      throw new Error(`Agent wallet initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get agent wallet by address
   */
  getAgentWallet(address: string): AgentWallet | undefined {
    return this.agents.get(address);
  }

  /**
   * Get all agent wallets
   */
  getAllAgentWallets(): AgentWallet[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent wallet balance
   */
  async getWalletBalance(address: string): Promise<string> {
    const agent = this.agents.get(address);
    if (!agent) {
      throw new Error('Agent wallet not found');
    }

    try {
      // Use agentkit to get balance
      const toolkit = agent.agentkit.toolkit;
      const tools = toolkit?.getTools() || [];
      
      // Find balance tool
      const balanceTool = tools.find((tool: any) => 
        tool.name === 'get_balance' || tool.name === 'get_eoa_balance'
      );

      if (balanceTool) {
        const balance = await balanceTool.call({ address });
        return balance.toString();
      }

      // Fallback to direct RPC call
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);

    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      return '0';
    }
  }

  /**
   * Execute a transaction using the agent wallet
   */
  async executeTransaction(address: string, transaction: {
    to: string;
    value?: string;
    data?: string;
  }): Promise<string> {
    const agent = this.agents.get(address);
    if (!agent) {
      throw new Error('Agent wallet not found');
    }

    try {
      const toolkit = agent.agentkit.toolkit;
      const tools = toolkit?.getTools() || [];
      
      // Find transfer/transaction tool
      const transferTool = tools.find((tool: any) => 
        tool.name === 'smart_transfer' || tool.name === 'send_transaction'
      );

      if (transferTool) {
        const result = await transferTool.call(transaction);
        return result.opHash || result.hash || result.transactionHash;
      }

      throw new Error('No transaction tool available');

    } catch (error) {
      console.error('Failed to execute transaction:', error);
      throw error;
    }
  }

  /**
   * Remove agent wallet from memory (but keep private key safe)
   */
  removeAgentWallet(address: string): boolean {
    return this.agents.delete(address);
  }
}

export const agentWalletManager = AgentWalletManager.getInstance();
