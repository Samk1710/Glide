export const AIRDROP_JSON_PROMPT = `
You are a data producer that emits ONLY valid JSON. No prose, no markdown, no comments.

TASK: Produce a realistic list of upcoming or speculative WEB3 AIRDROP OPPORTUNITIES that *appear inferred from public Twitter/X chatter*. The data will be used for research; it must be rich, structured, and plausible. DO NOT copy real tweets; synthesize credible handles/links to public posts from official project accounts or news aggregators.

HARD REQUIREMENTS:
- Output a single JSON array of 8–12 objects.
- Each object MUST strictly follow this JSON Schema (keys and types):
{
  "slug": string-lowercase-kebab,
  "name": string,
  "category": string,
  "primary_chain": string,
  "chains": string[],
  "timeline": {
    "rumor_window_start": ISO_8601,
    "rumor_window_end": ISO_8601 | omit,
    "snapshot_hint": string | omit,
    "expected_claim_window": { "start": ISO_8601 | omit, "end": ISO_8601 | omit } | omit
  },
  "links": {
    "website": url | omit,
    "docs": url | omit,
    "app": url | omit,
    "claim_url": url | omit
  },
  "sources": {
    "twitter_threads": [
      { "handle": string-with-@, "url": url, "tweet_id": string, "posted_at": ISO_8601 },
      ... 1 to 3 entries ...
    ],
    "evidence_level": "rumor" | "strong" | "confirmed"
  },
  "requirements": {
    "onchain": {
      "chains": string[],
      "min_transactions": number,
      "required_tx_types": string[],
      "bridge_activity": {"required": boolean, "min_value_usd": number | omit, "from_chains": string[] | omit, "to_chains": string[] | omit} | omit,
      "lp_activity": {"required": boolean, "pools": string[] | omit, "min_liquidity_usd": number | omit, "duration_days": number | omit} | omit,
      "swap_volume_usd_min": number | omit,
      "nft_holdings": [{"collection": string, "contract": string, "chain": string, "min_quantity": number}] | [],
      "governance": {"voted_proposals_min": number | omit, "delegated_stake_min": number | omit} | omit,
      "staking": [{"contract": string, "chain": string, "min_days": number, "min_amount": number | omit}] | []
    },
    "offchain": {
      "twitter_follow": string[],
      "twitter_retweets_min": number | omit,
      "discord_join": string[],
      "quests": [{"title": string, "platform": string, "url": url, "points": number | omit}],
      "referrals": {"enabled": boolean, "min_referrals": number | omit, "referral_url": url | omit} | omit,
      "kyc_required": boolean
    }
  },
  "sybil_resistance": {
    "heuristics": string[],
    "disqualifiers": string[]
  },
  "allocation": {
    "token_ticker": string,
    "total_pool_tokens": number,
    "vesting": {"cliff_days": number, "vesting_months": number},
    "formula": string,
    "weights": {"onchain_activity": number, "social": number, "loyalty_time": number, "bonus_nft": number}
  },
  "estimates": {
    "expected_value_usd_range": [number, number],
    "probability": "low" | "medium" | "high",
    "notes": string | omit
  },
  "gas_breakdown": [ {"chain": string, "action": string, "est_gas_native": number, "est_gas_usd": number} ],
  "ai_synthesized_demo": true
}

STYLE:
- Use believable numeric ranges for tx counts, USD volumes, vesting, and gas.
- Use official-style Twitter handles (e.g., @project, @projectlabs) and realistic tweet URLs like https://twitter.com/<handle>/status/<id>.
- Chains must be diverse (L1, L2, alt-L1, modular): include at least Ethereum, Base, Arbitrum, Solana or Polygon, and a zk chain.
- Evidence levels must be mixed.
- Output ONLY the JSON array, nothing else.
`;
