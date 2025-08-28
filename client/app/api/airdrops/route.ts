import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import AirdropModel from '@/lib/models/Airdrop';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    await dbConnect();
    
    // Check if we have any airdrops in the database
    const count = await AirdropModel.countDocuments();
    
    // If no airdrops exist, generate some fake ones
    if (count === 0) {
      console.log('No airdrops found, generating fake data...');
      await generateFakeAirdrops();
    }
    
    // Fetch the first 10 airdrops
    const items = await AirdropModel.find({}).sort({ createdAt: -1 }).limit(10).lean();
    return NextResponse.json({ ok: true, data: items, count: items.length });
  } catch (error: any) {
    console.error('Error in airdrops GET:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// Function to generate fake airdrops without external API
async function generateFakeAirdrops() {
  const fakeAirdrops = [
    {
      slug: "zksync-era-airdrop",
      name: "zkSync Era",
      category: "Layer 2",
      primary_chain: "Ethereum",
      chains: ["Ethereum", "zkSync Era"],
      timeline: {
        rumor_window_start: "2024-01-15T00:00:00Z",
        rumor_window_end: "2024-06-30T23:59:59Z",
        snapshot_hint: "Multiple snapshots throughout 2024",
        expected_claim_window: {
          start: "2024-07-01T00:00:00Z",
          end: "2024-12-31T23:59:59Z"
        }
      },
      links: {
        website: "https://zksync.io",
        docs: "https://docs.zksync.io",
        app: "https://portal.zksync.io"
      },
      sources: {
        twitter_threads: [
          {
            handle: "@zksync",
            url: "https://twitter.com/zksync/status/1750123456789",
            tweet_id: "1750123456789",
            posted_at: "2024-01-15T10:30:00Z"
          }
        ],
        evidence_level: "strong"
      },
      requirements: {
        onchain: {
          chains: ["Ethereum", "zkSync Era"],
          min_transactions: 5,
          required_tx_types: ["bridge", "swap", "mint"],
          bridge_activity: {
            required: true,
            min_value_usd: 100,
            from_chains: ["Ethereum"],
            to_chains: ["zkSync Era"]
          },
          swap_volume_usd_min: 500,
          nft_holdings: [],
          staking: []
        },
        offchain: {
          twitter_follow: ["@zksync"],
          discord_join: ["zkSync Discord"],
          quests: [
            {
              title: "Complete zkSync Bridge Tutorial",
              platform: "zkSync Portal",
              url: "https://portal.zksync.io/tutorial",
              points: 100
            }
          ],
          kyc_required: false
        }
      },
      sybil_resistance: {
        heuristics: ["Unique wallet addresses", "Transaction history depth", "Bridge value thresholds"],
        disqualifiers: ["Identified Sybil clusters", "Automated transaction patterns"]
      },
      allocation: {
        token_ticker: "ZK",
        total_pool_tokens: 1000000000,
        vesting: {
          cliff_days: 0,
          vesting_months: 12
        },
        formula: "Points-based allocation with bridge volume multiplier",
        weights: {
          onchain_activity: 0.7,
          social: 0.1,
          loyalty_time: 0.15,
          bonus_nft: 0.05
        }
      },
      estimates: {
        expected_value_usd_range: [500, 2000],
        probability: "high",
        notes: "Strong fundamentals and active development"
      },
      gas_breakdown: [
        {
          chain: "Ethereum",
          action: "Bridge to zkSync",
          est_gas_native: 0.015,
          est_gas_usd: 45
        },
        {
          chain: "zkSync Era", 
          action: "Swap tokens",
          est_gas_native: 0.001,
          est_gas_usd: 2
        }
      ],
      ai_synthesized_demo: true
    },
    {
      slug: "starknet-mainnet-airdrop",
      name: "StarkNet",
      category: "Layer 2",
      primary_chain: "Ethereum",
      chains: ["Ethereum", "StarkNet"],
      timeline: {
        rumor_window_start: "2024-02-01T00:00:00Z",
        snapshot_hint: "February 2024 snapshot",
        expected_claim_window: {
          start: "2024-08-01T00:00:00Z"
        }
      },
      links: {
        website: "https://starknet.io",
        docs: "https://docs.starknet.io"
      },
      sources: {
        twitter_threads: [
          {
            handle: "@StarkWareLtd",
            url: "https://twitter.com/StarkWareLtd/status/1751234567890",
            tweet_id: "1751234567890", 
            posted_at: "2024-02-01T14:20:00Z"
          }
        ],
        evidence_level: "rumor"
      },
      requirements: {
        onchain: {
          chains: ["StarkNet"],
          min_transactions: 10,
          required_tx_types: ["transfer", "contract_call"],
          nft_holdings: [],
          staking: []
        },
        offchain: {
          twitter_follow: ["@StarkWareLtd"],
          quests: [],
          kyc_required: false
        }
      },
      sybil_resistance: {
        heuristics: ["Transaction diversity", "Smart contract interactions"],
        disqualifiers: ["Bot-like behavior patterns"]
      },
      allocation: {
        token_ticker: "STRK",
        total_pool_tokens: 500000000,
        vesting: {
          cliff_days: 30,
          vesting_months: 6
        },
        formula: "Activity-based distribution",
        weights: {
          onchain_activity: 0.8,
          social: 0.1,
          loyalty_time: 0.1
        }
      },
      estimates: {
        expected_value_usd_range: [200, 800],
        probability: "medium"
      },
      gas_breakdown: [
        {
          chain: "StarkNet",
          action: "Contract interaction",
          est_gas_native: 0.002,
          est_gas_usd: 5
        }
      ],
      ai_synthesized_demo: true
    }
  ];

  // Add more fake airdrops to reach 10
  const additionalAirdrops = [
    "arbitrum-odyssey", "optimism-superchain", "polygon-zkvm", "base-onchain-summer",
    "blast-big-bang", "scroll-sessions", "linea-voyage", "mantle-journey"
  ].map((slug, index) => ({
    ...fakeAirdrops[0], // Use first as template
    slug,
    name: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    timeline: {
      ...fakeAirdrops[0].timeline,
      rumor_window_start: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString()
    },
    sources: {
      twitter_threads: [{
        handle: `@${slug.split('-')[0]}`,
        url: `https://twitter.com/${slug.split('-')[0]}/status/${1750000000000 + index}`,
        tweet_id: `${1750000000000 + index}`,
        posted_at: new Date(Date.now() + index * 60 * 60 * 1000).toISOString()
      }],
      evidence_level: ["rumor", "strong", "confirmed"][index % 3] as any
    }
  }));

  const allFakeAirdrops = [...fakeAirdrops, ...additionalAirdrops];

  // Insert fake airdrops into database
  for (const airdrop of allFakeAirdrops) {
    await AirdropModel.findOneAndUpdate(
      { slug: airdrop.slug },
      airdrop,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  
  console.log(`Generated ${allFakeAirdrops.length} fake airdrops`);
}
