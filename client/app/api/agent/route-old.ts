import { NextRequest, NextResponse } from 'next/server';
import { createAirdropAgent, type AgentConfig } from '@/lib/agent/airdrop-agent';
import { WalletData } from '@/types/onboarding';

export const dynamic = 'force-dynamic';

// Store agent instances (in production, use Redis or database)
const agentInstances = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
    const { action, ...data } = await req.json();

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
        const agent = createAirdropAgent(agentConfig);
        const { address, privateKey } = await agent.initializeWithNewWallet();
        
        agentInstances.set(address, agent);
        
        return NextResponse.json({
          success: true,
          data: { address, privateKey }
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

        const agent = createAirdropAgent(agentConfig);
        const address = await agent.initializeWithImportedWallet(privateKey);
        
        agentInstances.set(address, agent);
        
        return NextResponse.json({
          success: true,
          data: { address }
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

        const agent = agentInstances.get(agentAddress);
        if (!agent) {
          return NextResponse.json(
            { error: 'Agent not found' },
            { status: 404 }
          );
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

        const agent = agentInstances.get(agentAddress);
        if (!agent) {
          return NextResponse.json(
            { error: 'Agent not found' },
            { status: 404 }
          );
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

        const agent = agentInstances.get(agentAddress);
        if (!agent) {
          return NextResponse.json(
            { error: 'Agent not found' },
            { status: 404 }
          );
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

        const agent = agentInstances.get(agentAddress);
        if (!agent) {
          return NextResponse.json(
            { error: 'Agent not found' },
            { status: 404 }
          );
        }

        const balance = await agent.getAgentWalletBalance();
        
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

        const agent = agentInstances.get(agentAddress);
        if (!agent) {
          return NextResponse.json(
            { error: 'Agent not found' },
            { status: 404 }
          );
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

        const agent = agentInstances.get(agentAddress);
        if (!agent) {
          return NextResponse.json(
            { error: 'Agent not found' },
            { status: 404 }
          );
        }

        const response = await agent.chat(message);
        
        return NextResponse.json({
          success: true,
          data: { response }
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

    switch (action) {
      case 'list_agents': {
        const addresses = Array.from(agentInstances.keys());
        return NextResponse.json({
          success: true,
          data: { addresses }
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
