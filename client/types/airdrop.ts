import { z } from 'zod';

export const TwitterSourceZ = z.object({
  handle: z.string(),
  url: z.string().url(),
  tweet_id: z.string(),
  posted_at: z.string() // ISO datetime
});

export const OnchainReqZ = z.object({
  chains: z.array(z.string()).min(1),
  min_transactions: z.number().int().nonnegative(),
  required_tx_types: z.array(z.string()).optional().default([]),
  bridge_activity: z.object({
    required: z.boolean().default(false),
    min_value_usd: z.number().nonnegative().optional(),
    from_chains: z.array(z.string()).optional(),
    to_chains: z.array(z.string()).optional()
  }).optional(),
  lp_activity: z.object({
    required: z.boolean().default(false),
    pools: z.array(z.string()).optional(),
    min_liquidity_usd: z.number().nonnegative().optional(),
    duration_days: z.number().int().nonnegative().optional()
  }).optional(),
  swap_volume_usd_min: z.number().nonnegative().optional(),
  nft_holdings: z.array(z.object({
    collection: z.string(),
    contract: z.string(),
    chain: z.string(),
    min_quantity: z.number().int().nonnegative().default(1)
  })).optional().default([]),
  governance: z.object({
    voted_proposals_min: z.number().int().nonnegative().optional(),
    delegated_stake_min: z.number().nonnegative().optional()
  }).optional(),
  staking: z.array(z.object({
    contract: z.string(),
    chain: z.string(),
    min_days: z.number().int().nonnegative(),
    min_amount: z.number().nonnegative().optional()
  })).optional().default([])
});

export const OffchainReqZ = z.object({
  twitter_follow: z.array(z.string()).optional().default([]),
  twitter_retweets_min: z.number().int().nonnegative().optional(),
  discord_join: z.array(z.string()).optional().default([]),
  quests: z.array(z.object({
    title: z.string(),
    platform: z.string(),
    url: z.string().url(),
    points: z.number().int().nonnegative().optional()
  })).optional().default([]),
  referrals: z.object({
    enabled: z.boolean().default(false),
    min_referrals: z.number().int().nonnegative().optional(),
    referral_url: z.string().url().optional()
  }).optional(),
  kyc_required: z.boolean().default(false)
});

export const AllocationZ = z.object({
  token_ticker: z.string(),
  total_pool_tokens: z.number().nonnegative(),
  vesting: z.object({
    cliff_days: z.number().int().nonnegative().default(0),
    vesting_months: z.number().int().nonnegative().default(0)
  }),
  formula: z.string(),
  weights: z.object({
    onchain_activity: z.number().nonnegative(),
    social: z.number().nonnegative(),
    loyalty_time: z.number().nonnegative(),
    bonus_nft: z.number().nonnegative().optional()
  })
});

export const GasStepZ = z.object({
  chain: z.string(),
  action: z.string(),
  est_gas_native: z.number().nonnegative(),
  est_gas_usd: z.number().nonnegative()
});

export const AirdropZ = z.object({
  slug: z.string(),
  name: z.string(),
  category: z.string(),
  primary_chain: z.string(),
  chains: z.array(z.string()).min(1),
  timeline: z.object({
    rumor_window_start: z.string(),
    rumor_window_end: z.string().optional(),
    snapshot_hint: z.string().optional(),
    expected_claim_window: z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional()
  }),
  links: z.object({
    website: z.string().url().optional(),
    docs: z.string().url().optional(),
    app: z.string().url().optional(),
    claim_url: z.string().url().optional()
  }),
  sources: z.object({
    twitter_threads: z.array(TwitterSourceZ).min(1),
    evidence_level: z.enum(["rumor", "strong", "confirmed"]).default("rumor")
  }),
  requirements: z.object({
    onchain: OnchainReqZ,
    offchain: OffchainReqZ
  }),
  sybil_resistance: z.object({
    heuristics: z.array(z.string()).optional().default([]),
    disqualifiers: z.array(z.string()).optional().default([])
  }),
  allocation: AllocationZ,
  estimates: z.object({
    expected_value_usd_range: z.tuple([z.number(), z.number()]),
    probability: z.enum(["low", "medium", "high"]),
    notes: z.string().optional()
  }),
  gas_breakdown: z.array(GasStepZ),
  ai_synthesized_demo: z.boolean().default(true)
});

export type Airdrop = z.infer<typeof AirdropZ>;
