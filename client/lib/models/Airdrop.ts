import mongoose, { Schema } from 'mongoose';
import type { Airdrop } from '@/types/airdrop';

const TwitterSourceSchema = new Schema({
  handle: String,
  url: String,
  tweet_id: String,
  posted_at: String
}, { _id: false });

const OnchainReqSchema = new Schema({
  chains: [String],
  min_transactions: Number,
  required_tx_types: [String],
  bridge_activity: {
    required: Boolean,
    min_value_usd: Number,
    from_chains: [String],
    to_chains: [String]
  },
  lp_activity: {
    required: Boolean,
    pools: [String],
    min_liquidity_usd: Number,
    duration_days: Number
  },
  swap_volume_usd_min: Number,
  nft_holdings: [{
    collection: String,
    contract: String,
    chain: String,
    min_quantity: Number
  }],
  governance: {
    voted_proposals_min: Number,
    delegated_stake_min: Number
  },
  staking: [{
    contract: String,
    chain: String,
    min_days: Number,
    min_amount: Number
  }]
}, { _id: false });

const OffchainReqSchema = new Schema({
  twitter_follow: [String],
  twitter_retweets_min: Number,
  discord_join: [String],
  quests: [{ title: String, platform: String, url: String, points: Number }],
  referrals: { enabled: Boolean, min_referrals: Number, referral_url: String },
  kyc_required: Boolean
}, { _id: false });

const AllocationSchema = new Schema({
  token_ticker: String,
  total_pool_tokens: Number,
  vesting: { cliff_days: Number, vesting_months: Number },
  formula: String,
  weights: { onchain_activity: Number, social: Number, loyalty_time: Number, bonus_nft: Number }
}, { _id: false });

const GasStepSchema = new Schema({
  chain: String,
  action: String,
  est_gas_native: Number,
  est_gas_usd: Number
}, { _id: false });

const AirdropSchema = new Schema<Airdrop>({
  slug: { type: String, index: true, unique: true },
  name: String,
  category: String,
  primary_chain: String,
  chains: [String],
  timeline: {
    rumor_window_start: String,
    rumor_window_end: String,
    snapshot_hint: String,
    expected_claim_window: { start: String, end: String }
  },
  links: { website: String, docs: String, app: String, claim_url: String },
  sources: {
    twitter_threads: [TwitterSourceSchema],
    evidence_level: { type: String, enum: ['rumor','strong','confirmed'], default: 'rumor' }
  },
  requirements: { onchain: OnchainReqSchema, offchain: OffchainReqSchema },
  sybil_resistance: { heuristics: [String], disqualifiers: [String] },
  allocation: AllocationSchema,
  estimates: {
    expected_value_usd_range: { type: [Number], default: [0,0] },
    probability: { type: String, enum: ['low','medium','high'], default: 'medium' },
    notes: String
  },
  gas_breakdown: [GasStepSchema],
  ai_synthesized_demo: { type: Boolean, default: true }
}, { timestamps: true });

export default (mongoose.models.Airdrop as mongoose.Model<Airdrop>) || mongoose.model<Airdrop>('Airdrop', AirdropSchema);
