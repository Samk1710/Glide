import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import AirdropModel from '@/lib/models/Airdrop';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Generate 47-60 new random airdrops each time
    const count = Math.floor(Math.random() * 14) + 47; // Random between 47-60
    const airdrops = await generateRandomAirdrops(count)
    
    return NextResponse.json({
      success: true,
      airdrops,
      count: airdrops.length
    })
  } catch (error) {
    console.error('Error generating airdrops:', error)
    return NextResponse.json(
      { error: 'Failed to generate airdrops' },
      { status: 500 }
    )
  }
}

// Function to generate random airdrops for dashboard feed
async function generateRandomAirdrops(count: number = 7) {
  const chains = [
    "Ethereum", "Polygon", "Arbitrum", "Optimism", "Base", "Blast", 
    "zkSync Era", "StarkNet", "Scroll", "Linea", "Mantle", "Avalanche",
    "Sui", "Aptos", "Celestia", "Manta", "Mode", "Taiko", "Zora",
    "Immutable X", "Loopring", "Metis", "Boba", "Moonbeam", "Canto"
  ];
  
  const categories = [
    "Layer 2", "DeFi", "NFT", "Gaming", "Infrastructure", "AI", 
    "RWA", "Social", "Privacy", "Cross-Chain", "Oracle", "Storage",
    "Identity", "Governance", "Yield Farming", "Perpetuals", "Options",
    "Insurance", "DAO Tools", "Analytics", "MEV", "ZK", "Modular"
  ];
  
  const projectNames = [
    "zkSync Era", "Arbitrum Nitro", "Optimism Superchain", "Base Onchain", 
    "Blast Points", "Scroll Sessions", "Linea Voyage", "Mantle Journey",
    "Polygon zkEVM", "StarkNet Alpha", "Avalanche Rush", "Celestia Modular",
    "Sui Foundation", "Aptos Labs", "Manta Pacific", "Mode Network",
    "Taiko Alpha", "Zora Create", "Immutable Games", "Loopring L2",
    "LayerZero Bridge", "Wormhole Connect", "Hyperlane Interchain", "Axelar Network",
    "Eigenlayer AVS", "Babylon Bitcoin", "Pendle Yield", "GMX Trading",
    "dYdX Perpetuals", "Jupiter Exchange", "Drift Protocol", "Marginfi Lend",
    "Solend Finance", "Raydium AMM", "Orca DEX", "Tensor NFT",
    "Magic Eden", "OpenSea Pro", "LooksRare V2", "Blur Marketplace",
    "Friend.tech Social", "Lens Protocol", "Farcaster Frames", "Paragraph Publishing",
    "Mirror Writing", "Snapshot Voting", "Tally Governance", "Commonwealth Gov",
    "Compound Finance", "Aave Protocol", "MakerDAO", "Curve Finance",
    "Uniswap V4", "SushiSwap", "PancakeSwap", "TraderJoe",
    "Synthetix Perps", "Kwenta Trading", "Lyra Options", "Dopex Options",
    "Ribbon Finance", "Yearn Vaults", "Beefy Finance", "Harvest Finance"
  ];

  const evidenceLevels = ["rumor", "strong", "confirmed"];
  
  const avatarUrls = [
    "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=150&h=150&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces", 
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1494790108755-2616b612b977?w=150&h=150&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?w=150&h=150&fit=crop&crop=faces"
  ];

  const projectImages = [
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1644361567881-4d6cfe59805b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=300&fit=crop"
  ];

  const randomAirdrops = [];
  
  for (let i = 0; i < count; i++) {
    const randomProject = projectNames[Math.floor(Math.random() * projectNames.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomChain = chains[Math.floor(Math.random() * chains.length)];
    const randomEvidence = evidenceLevels[Math.floor(Math.random() * evidenceLevels.length)];
    const randomAvatar = avatarUrls[Math.floor(Math.random() * avatarUrls.length)];
    const randomImage = Math.random() > 0.3 ? projectImages[Math.floor(Math.random() * projectImages.length)] : null;
    
    const slug = randomProject.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now() + i;
    
    randomAirdrops.push({
      _id: new Date().getTime() + i,
      slug,
      name: randomProject,
      category: randomCategory,
      primary_chain: randomChain,
      chains: [randomChain, ...chains.filter(c => c !== randomChain).slice(0, Math.floor(Math.random() * 3))],
      avatar_url: randomAvatar,
      image_url: randomImage,
      timeline: {
        rumor_window_start: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        rumor_window_end: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
        snapshot_hint: "Activity snapshot in progress",
        expected_claim_window: {
          start: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      links: {
        website: `https://${slug.split('-')[0]}.io`,
        docs: `https://docs.${slug.split('-')[0]}.io`,
        app: `https://app.${slug.split('-')[0]}.io`
      },
      sources: {
        twitter_threads: [
          {
            handle: `@${slug.split('-')[0]}`,
            url: `https://twitter.com/${slug.split('-')[0]}/status/${1750000000000 + i}`,
            tweet_id: `${1750000000000 + i}`,
            posted_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        evidence_level: randomEvidence
      },
      requirements: {
        onchain: {
          chains: [randomChain],
          min_transactions: Math.floor(Math.random() * 20) + 5,
          required_tx_types: ["bridge", "swap", "mint", "stake"].slice(0, Math.floor(Math.random() * 3) + 1),
          bridge_activity: {
            required: Math.random() > 0.5,
            min_value_usd: Math.floor(Math.random() * 500) + 100,
            from_chains: ["Ethereum"],
            to_chains: [randomChain]
          },
          swap_volume_usd_min: Math.floor(Math.random() * 1000) + 200,
          nft_holdings: [],
          staking: []
        },
        offchain: {
          twitter_follow: [`@${slug.split('-')[0]}`],
          discord_join: [`${randomProject} Discord`],
          quests: [
            {
              title: `Complete ${randomProject} Tutorial`,
              platform: randomProject,
              url: `https://tutorial.${slug.split('-')[0]}.io`,
              points: Math.floor(Math.random() * 200) + 50
            }
          ],
          kyc_required: Math.random() > 0.7
        }
      },
      allocation: {
        token_ticker: randomProject.split(' ')[0].toUpperCase().slice(0, 4),
        total_pool_tokens: Math.floor(Math.random() * 1000000000) + 100000000,
        vesting: {
          cliff_days: Math.floor(Math.random() * 90),
          vesting_months: Math.floor(Math.random() * 24) + 6
        },
        formula: "Activity-based allocation with bonus multipliers",
        weights: {
          onchain_activity: 0.6 + Math.random() * 0.2,
          social: 0.1 + Math.random() * 0.1,
          loyalty_time: 0.1 + Math.random() * 0.1,
          bonus_nft: 0.05 + Math.random() * 0.05
        }
      },
      estimates: {
        expected_value_usd_range: [
          Math.floor(Math.random() * 500) + 100, 
          Math.floor(Math.random() * 2000) + 800
        ],
        probability: randomEvidence === "confirmed" ? "high" : randomEvidence === "strong" ? "medium" : "low",
        notes: "Based on current market conditions and project fundamentals"
      },
      gas_breakdown: [
        {
          chain: randomChain,
          action: "Bridge/Swap Activity",
          est_gas_native: Math.random() * 0.02 + 0.005,
          est_gas_usd: Math.floor(Math.random() * 50) + 10
        }
      ],
      tweet_content: `🚀 ${randomProject} airdrop rumors heating up! Requirements include ${Math.floor(Math.random() * 20) + 5} transactions on ${randomChain}. Estimated value: $${Math.floor(Math.random() * 1000) + 200}-$${Math.floor(Math.random() * 2000) + 800}. Evidence level: ${randomEvidence} 📈 #${randomProject.replace(/\s+/g, '')} #Airdrop #${randomCategory.replace(/\s+/g, '')}`,
      username: `@${slug.split('-')[0]}official`,
      user_display_name: `${randomProject} Official`,
      created_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      ai_synthesized_demo: true
    });
  }

  return randomAirdrops;
}
