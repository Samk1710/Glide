import { NextRequest, NextResponse } from 'next/server';
import { createAirdropAgent, type AgentConfig } from '@/lib/agent/airdrop-agent';
import { agentWalletManager } from '@/lib/agent/wallet-manager';
import AgentSessionManager from '@/lib/utils/session-manager';
import { WalletData } from '@/types/onboarding';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

// Store agent instances (in production, use Redis or database)
const agentInstances = new Map<string, any>();

// Mock user ID for development - replace with actual auth
const getUserId = (request: NextRequest): string => {
  // In production, extract from JWT token or session
  return 'user_123';
};

export async function POST(req: NextRequest) {
  try {
    const { action, ...data } = await req.json();
    const userId = getUserId(req);
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || undefined;
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined;

    const agentConfig: AgentConfig = {
      openRouterApiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '',
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || '',
      apiKey: process.env.NEXT_PUBLIC_API_KEY || '',
      chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 43113
    };

    // Validate required environment variables
    if (!agentConfig.openRouterApiKey || !agentConfig.rpcUrl || !agentConfig.apiKey) {
      return NextResponse.json(
        { error: 'Missing required environment variables' },
        { status: 500 }
      );
    }

    switch (action) {
      case 'create_wallet': {
        // Create agent wallet using wallet manager (includes session persistence)
        const wallet = await agentWalletManager.createAgentWallet({
          rpcUrl: agentConfig.rpcUrl,
          apiKey: agentConfig.apiKey,
          chainId: agentConfig.chainId,
          userId
        });

        // Create airdrop agent instance
        const agent = createAirdropAgent(agentConfig);
        await agent.initializeWithImportedWallet(wallet.privateKey);
        
        agentInstances.set(wallet.address, agent);
        
        return NextResponse.json({
          success: true,
          data: { 
            address: wallet.address, 
            privateKey: wallet.privateKey, // Only return on creation for backup
            sessionId: wallet.sessionId 
          }
        });
      }

      case 'import_wallet': {
        const { privateKey } = data;
        if (!privateKey) {
          return NextResponse.json(
            { error: 'Private key is required' },
            { status: 400 }
          );
        }

        // Import agent wallet using wallet manager (includes session persistence)
        const wallet = await agentWalletManager.importAgentWallet({
          privateKey: privateKey as `0x${string}`,
          rpcUrl: agentConfig.rpcUrl,
          apiKey: agentConfig.apiKey,
          chainId: agentConfig.chainId,
          userId
        });

        // Create airdrop agent instance
        const agent = createAirdropAgent(agentConfig);
        await agent.initializeWithImportedWallet(privateKey);
        
        agentInstances.set(wallet.address, agent);
        
        return NextResponse.json({
          success: true,
          data: { 
            address: wallet.address,
            sessionId: wallet.sessionId 
          }
        });
      }

      case 'restore_session': {
        // Check if user has an active session
        const hasSession = await agentWalletManager.hasActiveSession(userId);
        
        if (!hasSession) {
          return NextResponse.json({
            success: false,
            error: 'No active session found'
          }, { status: 404 });
        }

        // Try to restore wallet from session
        const wallet = await agentWalletManager.restoreAgentWallet(userId);
        
        if (!wallet) {
          return NextResponse.json({
            success: false,
            error: 'Failed to restore agent wallet'
          }, { status: 404 });
        }

        // Create airdrop agent instance if not already in memory
        if (!agentInstances.has(wallet.address)) {
          const agent = createAirdropAgent(agentConfig);
          await agent.initializeWithImportedWallet(wallet.privateKey);
          agentInstances.set(wallet.address, agent);
        }

        return NextResponse.json({
          success: true,
          data: {
            address: wallet.address,
            sessionId: wallet.sessionId
          }
        });
      }

      case 'get_status': {
        // Try to restore session first
        const wallet = await agentWalletManager.restoreAgentWallet(userId);
        
        if (!wallet) {
          return NextResponse.json({
            success: false,
            message: 'No active agent wallet session'
          });
        }

        const balance = await agentWalletManager.getWalletBalance(wallet.address);
        
        return NextResponse.json({
          success: true,
          data: {
            address: wallet.address,
            balance,
            chainId: wallet.chainId,
            isConnected: true,
            sessionId: wallet.sessionId
          }
        });
      }

      case 'set_user_wallets': {
        const { agentAddress, wallets } = data;
        if (!agentAddress || !wallets) {
          return NextResponse.json(
            { error: 'Agent address and wallets are required' },
            { status: 400 }
          );
        }

        let agent = agentInstances.get(agentAddress);
        if (!agent) {
          // Try to restore from session
          const wallet = await agentWalletManager.restoreAgentWallet(userId);
          if (wallet && wallet.address === agentAddress) {
            agent = createAirdropAgent(agentConfig);
            await agent.initializeWithImportedWallet(wallet.privateKey);
            agentInstances.set(agentAddress, agent);
          } else {
            return NextResponse.json(
              { error: 'Agent not found and cannot be restored' },
              { status: 404 }
            );
          }
        }

        agent.setUserWallets(wallets as WalletData[]);
        
        return NextResponse.json({
          success: true,
          message: `Updated user wallets: ${wallets.length} wallet(s)`
        });
      }

      case 'analyze_airdrops': {
        const { agentAddress } = data;
        if (!agentAddress) {
          return NextResponse.json(
            { error: 'Agent address is required' },
            { status: 400 }
          );
        }

        let agent = agentInstances.get(agentAddress);
        if (!agent) {
          // Try to restore from session
          const wallet = await agentWalletManager.restoreAgentWallet(userId);
          if (wallet && wallet.address === agentAddress) {
            agent = createAirdropAgent(agentConfig);
            await agent.initializeWithImportedWallet(wallet.privateKey);
            agentInstances.set(agentAddress, agent);
          } else {
            return NextResponse.json(
              { error: 'Agent not found and cannot be restored' },
              { status: 404 }
            );
          }
        }

        const recommendations = await agent.analyzeAirdrops();
        
        return NextResponse.json({
          success: true,
          data: recommendations
        });
      }

      case 'auto_enroll': {
        const { agentAddress } = data;
        if (!agentAddress) {
          return NextResponse.json(
            { error: 'Agent address is required' },
            { status: 400 }
          );
        }

        let agent = agentInstances.get(agentAddress);
        if (!agent) {
          // Try to restore from session
          const wallet = await agentWalletManager.restoreAgentWallet(userId);
          if (wallet && wallet.address === agentAddress) {
            agent = createAirdropAgent(agentConfig);
            await agent.initializeWithImportedWallet(wallet.privateKey);
            agentInstances.set(agentAddress, agent);
          } else {
            return NextResponse.json(
              { error: 'Agent not found and cannot be restored' },
              { status: 404 }
            );
          }
        }

        const result = await agent.autoEnrollInEligibleAirdrops();
        
        return NextResponse.json({
          success: true,
          data: result
        });
      }

      case 'get_balance': {
        const { agentAddress } = data;
        if (!agentAddress) {
          return NextResponse.json(
            { error: 'Agent address is required' },
            { status: 400 }
          );
        }

        // Try to get balance directly from wallet manager first
        let balance = '0';
        try {
          balance = await agentWalletManager.getWalletBalance(agentAddress);
        } catch (error) {
          // If wallet not in memory, try to restore from session
          const wallet = await agentWalletManager.restoreAgentWallet(userId);
          if (wallet && wallet.address === agentAddress) {
            balance = await agentWalletManager.getWalletBalance(agentAddress);
          } else {
            return NextResponse.json(
              { error: 'Agent wallet not found' },
              { status: 404 }
            );
          }
        }
        
        return NextResponse.json({
          success: true,
          data: { balance }
        });
      }

      case 'get_activities': {
        const { agentAddress } = data;
        if (!agentAddress) {
          return NextResponse.json(
            { error: 'Agent address is required' },
            { status: 400 }
          );
        }

        let agent = agentInstances.get(agentAddress);
        if (!agent) {
          // Try to restore from session
          const wallet = await agentWalletManager.restoreAgentWallet(userId);
          if (wallet && wallet.address === agentAddress) {
            agent = createAirdropAgent(agentConfig);
            await agent.initializeWithImportedWallet(wallet.privateKey);
            agentInstances.set(agentAddress, agent);
          } else {
            return NextResponse.json(
              { error: 'Agent not found and cannot be restored' },
              { status: 404 }
            );
          }
        }

        const activities = agent.getActivities();
        
        return NextResponse.json({
          success: true,
          data: activities
        });
      }

      case 'chat': {
        const { agentAddress, message } = data;
        if (!agentAddress || !message) {
          return NextResponse.json(
            { error: 'Agent address and message are required' },
            { status: 400 }
          );
        }

        let agent = agentInstances.get(agentAddress);
        if (!agent) {
          // Try to restore from session
          const wallet = await agentWalletManager.restoreAgentWallet(userId);
          if (wallet && wallet.address === agentAddress) {
            agent = createAirdropAgent(agentConfig);
            await agent.initializeWithImportedWallet(wallet.privateKey);
            agentInstances.set(agentAddress, agent);
          } else {
            return NextResponse.json(
              { error: 'Agent not found and cannot be restored' },
              { status: 404 }
            );
          }
        }

        const response = await agent.chat(message);
        
        return NextResponse.json({
          success: true,
          data: { response }
        });
      }

      case 'clear_session': {
        const session = await AgentSessionManager.getSession(userId);
        
        if (session.agentAddress) {
          await agentWalletManager.clearAgentSession(session.agentAddress, userId);
          agentInstances.delete(session.agentAddress);
        }

        return NextResponse.json({
          success: true,
          message: 'Agent session cleared'
        });
      }

      case 'extend_session': {
        const extended = agentWalletManager.extendSession();
        
        return NextResponse.json({
          success: extended,
          message: extended ? 'Session extended' : 'Failed to extend session'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const userId = getUserId(req);

    switch (action) {
      case 'list_agents': {
        // Get active session info
        const session = await AgentSessionManager.getSession(userId);
        
        if (session.agentAddress) {
          return NextResponse.json({
            success: true,
            data: { 
              addresses: [session.agentAddress],
              sessionId: session.sessionId
            }
          });
        }

        return NextResponse.json({
          success: true,
          data: { addresses: [] }
        });
      }

      case 'session_status': {
        const hasSession = await agentWalletManager.hasActiveSession(userId);
        
        if (hasSession) {
          const session = await AgentSessionManager.getSession(userId);
          return NextResponse.json({
            success: true,
            data: {
              hasSession: true,
              address: session.agentAddress,
              chainId: session.chainId,
              sessionId: session.sessionId
            }
          });
        }

        return NextResponse.json({
          success: true,
          data: { hasSession: false }
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
