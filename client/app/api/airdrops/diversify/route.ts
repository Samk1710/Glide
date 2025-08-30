import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get airdrops from the main route
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/airdrops`);
    const data = await response.json();
    
    if (!data.airdrops) {
      return NextResponse.json({ error: 'No airdrops found' }, { status: 404 });
    }

    // Diversify each airdrop's tweet content
    const diversifiedAirdrops = data.airdrops.map((airdrop: any) => {
      return {
        ...airdrop,
        tweet_content: generateDiverseTweet(airdrop),
        user_display_name: generateDiverseDisplayName(airdrop),
        username: generateDiverseUsername(airdrop),
        created_at: generateRandomPostTime(),
        // Add some randomness to engagement metrics
        engagement: generateRandomEngagement(),
        // Vary the profile pictures
        avatar_url: generateRandomAvatar(airdrop),
        // Add some variations to requirements display
        requirements_display: diversifyRequirements(airdrop.requirements),
        // Randomize some visual elements
        visual_style: generateVisualVariations()
      };
    });

    return NextResponse.json({
      success: true,
      airdrops: diversifiedAirdrops,
      count: diversifiedAirdrops.length
    });
  } catch (error) {
    console.error('Error diversifying airdrops:', error);
    return NextResponse.json(
      { error: 'Failed to diversify airdrops' },
      { status: 500 }
    );
  }
}

// Generate diverse tweet writing styles
function generateDiverseTweet(airdrop: any) {
  const writingStyles = [
    'casual_enthusiast',
    'technical_analyst', 
    'hype_trader',
    'cautious_researcher',
    'emoji_heavy',
    'professional_brief',
    'community_focused',
    'yield_farmer',
    'narrative_storyteller',
    'data_driven'
  ];

  const style = writingStyles[Math.floor(Math.random() * writingStyles.length)];
  
  switch (style) {
    case 'casual_enthusiast':
      return generateCasualTweet(airdrop);
    case 'technical_analyst':
      return generateTechnicalTweet(airdrop);
    case 'hype_trader':
      return generateHypeTweet(airdrop);
    case 'cautious_researcher':
      return generateCautiousTweet(airdrop);
    case 'emoji_heavy':
      return generateEmojiTweet(airdrop);
    case 'professional_brief':
      return generateProfessionalTweet(airdrop);
    case 'community_focused':
      return generateCommunityTweet(airdrop);
    case 'yield_farmer':
      return generateYieldFarmerTweet(airdrop);
    case 'narrative_storyteller':
      return generateNarrativeTweet(airdrop);
    case 'data_driven':
      return generateDataDrivenTweet(airdrop);
    default:
      return airdrop.tweet_content;
  }
}

function generateCasualTweet(airdrop: any) {
  const casuals = [
    `yo ${airdrop.name} looking pretty solid ngl 👀\n\nheard they're doing airdrops soon, requirements seem chill:\n- ${airdrop.requirements?.onchain?.min_transactions || 5} txs minimum\n- some ${airdrop.primary_chain} activity\n\nnot financial advice but might be worth checking out 🤷‍♂️`,
    
    `just stumbled across ${airdrop.name} and damn... this could be interesting\n\nbasically you need to:\n• bridge to ${airdrop.primary_chain}\n• do some swaps (${airdrop.requirements?.onchain?.min_transactions || 5}+ txs)\n• maybe follow their socials\n\nesti rewards looking decent too 💰`,
    
    `${airdrop.name} alpha thread 🧵\n\ntbh this one's flying under the radar but the fundamentals look good\n\nwhat you need: bridge activity + ${airdrop.requirements?.onchain?.min_transactions || 5} txs on ${airdrop.primary_chain}\n\nworth the gas fees? probably 🤔`,
  ];
  return casuals[Math.floor(Math.random() * casuals.length)];
}

function generateTechnicalTweet(airdrop: any) {
  const technicals = [
    `${airdrop.name} Technical Analysis Thread 📊\n\nOnchain Requirements:\n• Min ${airdrop.requirements?.onchain?.min_transactions || 5} transactions\n• Bridge volume: $${airdrop.requirements?.onchain?.bridge_activity?.min_value_usd || 100}+\n• Supported chains: ${airdrop.primary_chain}\n\nAllocation: ${airdrop.allocation?.total_pool_tokens || '100M'} ${airdrop.allocation?.token_ticker || 'TOKEN'}\nVesting: ${airdrop.allocation?.vesting?.cliff_days || 30}d cliff\n\nProbability: ${airdrop.sources?.evidence_level || 'medium'} confidence`,
    
    `Analysis: ${airdrop.name} Airdrop Mechanics\n\n📈 Allocation Model:\n- Activity-based scoring\n- Bonus multipliers for early users\n- ${airdrop.allocation?.weights?.onchain_activity || 0.6} weight on onchain\n\n⚡ Gas Optimization:\n- Batch transactions recommended\n- Est. cost: $${Math.floor(Math.random() * 50) + 10}\n\n🎯 Expected ROI: ${Math.floor(Math.random() * 300) + 100}%`,
    
    `${airdrop.name} Airdrop Specification v1.0\n\nContract interactions required:\n✓ Bridge operations (${airdrop.primary_chain})\n✓ DEX swaps (min volume: $${airdrop.requirements?.onchain?.swap_volume_usd_min || 200})\n✓ Social verification\n\nSnapshot window: ${airdrop.timeline?.rumor_window_start ? 'Active' : 'TBD'}\nDistribution: ${airdrop.timeline?.expected_claim_window?.start ? 'Q1 2025' : 'TBD'}\n\nDYOR, not financial advice.`
  ];
  return technicals[Math.floor(Math.random() * technicals.length)];
}

function generateHypeTweet(airdrop: any) {
  const hypes = [
    `🚨 ${airdrop.name.toUpperCase()} AIRDROP ALERT 🚨\n\nTHIS IS NOT A DRILL!!! 🔥🔥🔥\n\n💎 MASSIVE airdrop incoming\n🚀 Bridge to ${airdrop.primary_chain} NOW\n⚡ ${airdrop.requirements?.onchain?.min_transactions || 5} transactions minimum\n💰 Could be $${Math.floor(Math.random() * 1000) + 500}+ each wallet\n\nLFG!!! 🌙🌙🌙`,
    
    `🔥🔥🔥 ${airdrop.name} GOING ABSOLUTELY NUCLEAR 🔥🔥🔥\n\nIF YOU'RE NOT FARMING THIS YOU'RE NGMI 📉\n\n🎯 Easy requirements:\n- Bridge activity ✅\n- ${airdrop.requirements?.onchain?.min_transactions || 5}+ swaps ✅\n- Follow + RT ✅\n\n🚀 TO THE MOON 🚀\n\n#${airdrop.name.replace(/\s+/g, '')} #AirdropSeason #WAGMI`,
    
    `GUYS THIS IS IT!!! ${airdrop.name} IS THE NEXT 100X 💎🚀\n\nSTOP SLEEPING ON THIS 😴\n\nREQUIREMENTS ARE LITERALLY FREE MONEY:\n✅ ${airdrop.primary_chain} bridge\n✅ few transactions (${airdrop.requirements?.onchain?.min_transactions || 5}+)\n✅ join discord\n\nLAST CALL BEFORE MOON 🌙✨\n\nRETWEET IF YOU'RE FARMING!! ⚡`
  ];
  return hypes[Math.floor(Math.random() * hypes.length)];
}

function generateCautiousTweet(airdrop: any) {
  const cautious = [
    `${airdrop.name} airdrop research notes 📝\n\nEvidence level: ${airdrop.sources?.evidence_level || 'rumored'}\nSource: Community speculation\n\nRequirements (unconfirmed):\n- ${airdrop.primary_chain} onchain activity\n- ${airdrop.requirements?.onchain?.min_transactions || 5}+ transactions\n\n⚠️ No official announcement yet\n⚠️ Farm at your own risk\n⚠️ Consider gas costs\n\nNFA, DYOR`,
    
    `${airdrop.name} due diligence thread 🔍\n\nWhat we know:\n✅ ${airdrop.category} protocol on ${airdrop.primary_chain}\n❓ Airdrop rumors circulating\n❓ No official confirmation\n\nPotential requirements:\n• Bridge activity\n• ${airdrop.requirements?.onchain?.min_transactions || 5}+ transactions\n• Social engagement\n\nRisk assessment: Medium\n\nAs always, DYOR and manage risk accordingly.`,
    
    `Evaluating ${airdrop.name} airdrop opportunity\n\nPros:\n+ Active development team\n+ Growing TVL\n+ ${airdrop.category} narrative trending\n\nCons:\n- No official airdrop confirmation\n- Gas costs may exceed rewards\n- Competition increasing\n\nRecommendation: Small allocation only\n\nNot financial advice, manage your risk`
  ];
  return cautious[Math.floor(Math.random() * cautious.length)];
}

function generateEmojiTweet(airdrop: any) {
  const emojis = [
    `🚨 ${airdrop.name} 🚨\n\n🎯 AIRDROP FARMING GUIDE 🎯\n\n1️⃣ Bridge to ${airdrop.primary_chain} 🌉\n2️⃣ Make ${airdrop.requirements?.onchain?.min_transactions || 5}+ swaps 🔄\n3️⃣ Follow socials 👥\n4️⃣ Join Discord 💬\n\n💰 Potential: $${Math.floor(Math.random() * 800) + 200}-$${Math.floor(Math.random() * 2000) + 800} 💰\n\n🔥 Don't fade this one! 🔥\n\n#Airdrop #${airdrop.primary_chain} #Crypto`,
    
    `✨ ${airdrop.name} Airdrop Alpha ✨\n\n🎪 Requirements:\n🌟 ${airdrop.primary_chain} activity\n⭐ ${airdrop.requirements?.onchain?.min_transactions || 5}+ transactions\n💫 Social tasks\n\n🎁 Estimated rewards:\n💎 ${airdrop.allocation?.total_pool_tokens || '100M'} ${airdrop.allocation?.token_ticker || 'TOKEN'} total pool\n🏆 ${Math.floor(Math.random() * 200) + 50}-${Math.floor(Math.random() * 500) + 300} tokens each\n\n🚀 LFG! 🚀`,
    
    `🔔 AIRDROP ALERT 🔔\n\n📱 ${airdrop.name}\n🔗 ${airdrop.primary_chain}\n⚡ ${airdrop.category}\n\n✅ TODO:\n🎯 Bridge funds\n🔄 Swap tokens (${airdrop.requirements?.onchain?.min_transactions || 5}x)\n👨‍💻 Use dApp\n📱 Social tasks\n\n🎰 Potential: 🤑🤑🤑\n\n👆 Thread below 👆`
  ];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

function generateProfessionalTweet(airdrop: any) {
  const professional = [
    `${airdrop.name} Airdrop Analysis\n\nProject: ${airdrop.category} protocol on ${airdrop.primary_chain}\nEvidence: ${airdrop.sources?.evidence_level || 'community speculation'}\n\nRequirements:\n• Minimum ${airdrop.requirements?.onchain?.min_transactions || 5} transactions\n• Bridge activity ($${airdrop.requirements?.onchain?.bridge_activity?.min_value_usd || 100}+ recommended)\n• Social verification\n\nTimeline: TBD\nExpected allocation: Variable based on activity\n\nDisclaimer: Speculative opportunity, DYOR`,
    
    `Investment Research: ${airdrop.name}\n\nSector: ${airdrop.category}\nChain: ${airdrop.primary_chain}\nStage: ${airdrop.timeline ? 'Active farming' : 'Pre-announcement'}\n\nParticipation criteria:\n- Onchain activity threshold: ${airdrop.requirements?.onchain?.min_transactions || 5} transactions\n- Bridge utilization required\n- Community engagement\n\nROI estimate: Moderate to high, pending confirmation\n\nRisk level: Medium (unconfirmed airdrop)`,
    
    `${airdrop.name} Protocol Overview\n\nValue Proposition: ${airdrop.category} infrastructure\nNetwork: ${airdrop.primary_chain}\nToken Distribution: ${airdrop.allocation?.total_pool_tokens || 'TBD'} ${airdrop.allocation?.token_ticker || 'TOKEN'}\n\nEligibility requirements:\n• Transaction history: ${airdrop.requirements?.onchain?.min_transactions || 5}+ operations\n• Cross-chain activity preferred\n• Social proof verification\n\nNote: Airdrop unconfirmed, participate at discretion`
  ];
  return professional[Math.floor(Math.random() * professional.length)];
}

function generateCommunityTweet(airdrop: any) {
  const community = [
    `Hey fam! 👋 Found another potential airdrop to farm together\n\n${airdrop.name} on ${airdrop.primary_chain} might be distributing tokens soon!\n\nWho's joining me? We can:\n• Share gas optimization tips\n• Help each other with requirements\n• Track progress together\n\nLMK if you're in! 🤝\n\n#AirdropFamily #TogetherWeClaim`,
    
    `Community call! 📢\n\n${airdrop.name} airdrop farming group forming 👥\n\nWhat we'll do:\n✅ Share requirement updates\n✅ Split research workload  \n✅ Optimize strategies together\n✅ Celebrate when we claim! 🎉\n\nRequirements looking like:\n- ${airdrop.primary_chain} bridge\n- ${airdrop.requirements?.onchain?.min_transactions || 5}+ swaps\n\nWho's joining? Drop a 🚀 below!`,
    
    `Building ${airdrop.name} farming squad! 🛠️\n\nReason: Stronger together than alone\n\nWhat we share:\n🧠 Research & alpha\n⚡ Gas optimization tricks\n🎯 Requirement tracking\n💡 Strategy improvements\n\nCurrent target:\n• ${airdrop.primary_chain} activity\n• ${airdrop.requirements?.onchain?.min_transactions || 5}+ transactions\n\nComment "LFG" to join the crew! 🤝`
  ];
  return community[Math.floor(Math.random() * community.length)];
}

function generateYieldFarmerTweet(airdrop: any) {
  const farmers = [
    `Yield farming update: Adding ${airdrop.name} to rotation 🌾\n\nAPY calculation:\n• Gas cost: ~$${Math.floor(Math.random() * 50) + 10}\n• Time investment: 2-3 hours\n• Expected return: $${Math.floor(Math.random() * 800) + 200}+\n• ROI: ${Math.floor(Math.random() * 500) + 100}%\n\nFarm requirements:\n- ${airdrop.primary_chain} bridge\n- ${airdrop.requirements?.onchain?.min_transactions || 5}+ swaps\n\nAdding to my DeFi farming portfolio`,
    
    `Portfolio diversification: ${airdrop.name} added ✅\n\nCurrent airdrop farming allocation:\n• 40% Layer 2 protocols\n• 30% DeFi platforms  \n• 20% Infrastructure\n• 10% Experimental (like this one)\n\n${airdrop.name} fits ${airdrop.category} thesis\nRequirements: Bridge + ${airdrop.requirements?.onchain?.min_transactions || 5} txs\nCost basis: $${Math.floor(Math.random() * 30) + 5} gas\n\nManaging 47 farms currently 📊`,
    
    `Farm #${Math.floor(Math.random() * 50) + 15}: ${airdrop.name}\n\nMetrics:\n🎯 Difficulty: ${Math.floor(Math.random() * 3) + 1}/5\n⏱️ Time: 2-4 hours\n💰 Est. reward: $${Math.floor(Math.random() * 600) + 200}\n📊 Probability: ${airdrop.sources?.evidence_level || 'medium'}\n\nExecuted:\n✅ ${airdrop.primary_chain} bridge\n⏳ Working on ${airdrop.requirements?.onchain?.min_transactions || 5} transactions\n⏳ Social requirements\n\nDiversified airdrop farming ftw 🌾`
  ];
  return farmers[Math.floor(Math.random() * farmers.length)];
}

function generateNarrativeTweet(airdrop: any) {
  const narratives = [
    `The ${airdrop.category} narrative is just getting started... 📖\n\n${airdrop.name} represents the next wave of innovation on ${airdrop.primary_chain}\n\nEarly participants who bridge and interact now might be rewarded for believing in the vision before the masses arrive.\n\nRequirements are simple:\n• ${airdrop.requirements?.onchain?.min_transactions || 5} transactions\n• Genuine platform usage\n\nHistory favors the early believers ⏰`,
    
    `Remember when everyone said DeFi was just a fad? 🤔\n\nNow ${airdrop.category} protocols are the next frontier...\n\n${airdrop.name} is building something different on ${airdrop.primary_chain}. Those who bridge over and start using it with genuine intent (${airdrop.requirements?.onchain?.min_transactions || 5}+ transactions) might be part of the next chapter.\n\nNot about the airdrop. About being early to innovation. 🚀`,
    
    `Every bull market has its defining moment... 💭\n\nLast cycle: DeFi summer\nThis cycle: ${airdrop.category} infrastructure\n\n${airdrop.name} is positioning itself at the center of this narrative.\n\nWhile others chase yesterday's trends, early ${airdrop.primary_chain} adopters are quietly building positions.\n\nRequirements: Bridge + ${airdrop.requirements?.onchain?.min_transactions || 5} real transactions\n\nThe future is being built today. 🏗️`
  ];
  return narratives[Math.floor(Math.random() * narratives.length)];
}

function generateDataDrivenTweet(airdrop: any) {
  const dataFocused = [
    `${airdrop.name} Airdrop Analytics 📊\n\nOnchain data analysis:\n• Bridge volume trend: +${Math.floor(Math.random() * 150) + 50}% (30d)\n• Unique users: ${Math.floor(Math.random() * 50000) + 10000}\n• Avg transaction value: $${Math.floor(Math.random() * 200) + 50}\n\nBenchmark vs competitors:\n• User growth: Top 15%\n• TVL increase: +${Math.floor(Math.random() * 300) + 100}%\n\nMinimum qualification: ${airdrop.requirements?.onchain?.min_transactions || 5} transactions\n\nData suggests strong fundamentals 📈`,
    
    `Statistical Analysis: ${airdrop.name}\n\n📈 Platform metrics (30d):\n• Transaction count: +${Math.floor(Math.random() * 200) + 100}%\n• Bridge utilization: ${Math.floor(Math.random() * 80) + 20}%\n• User retention: ${Math.floor(Math.random() * 40) + 60}%\n\n🎯 Airdrop eligibility:\n• Min activity: ${airdrop.requirements?.onchain?.min_transactions || 5} transactions\n• Bridge requirement: $${airdrop.requirements?.onchain?.bridge_activity?.min_value_usd || 100}+\n\n📊 Historical comp: Similar protocols averaged $${Math.floor(Math.random() * 500) + 300} rewards\n\nData-driven farming approach`,
    
    `Quantitative Assessment: ${airdrop.name}\n\nKPIs tracked:\n• Daily active users: ${Math.floor(Math.random() * 10000) + 5000}\n• Bridge success rate: ${Math.floor(Math.random() * 20) + 80}%\n• Gas efficiency: ${Math.floor(Math.random() * 30) + 70}% vs Layer 1\n\nCorrelation analysis:\n• Higher transaction count = larger allocations (historical)\n• Bridge users received 2.3x median rewards\n\nStrategy: Minimum ${airdrop.requirements?.onchain?.min_transactions || 5} quality transactions\nPlatform: ${airdrop.primary_chain}\n\nNumbers don't lie 🔢`
  ];
  return dataFocused[Math.floor(Math.random() * dataFocused.length)];
}

// Generate diverse display names
function generateDiverseDisplayName(airdrop: any) {
  const nameStyles = [
    `${airdrop.name} Official`,
    `${airdrop.name} Protocol`,
    `${airdrop.name} | ${airdrop.category}`,
    `${airdrop.name} 🚀`,
    `${airdrop.name} Labs`,
    `Build on ${airdrop.name}`,
    `${airdrop.name} ⚡`,
    `${airdrop.name} Network`,
    `${airdrop.name} 🌟`,
    `${airdrop.name} Foundation`
  ];
  return nameStyles[Math.floor(Math.random() * nameStyles.length)];
}

// Generate diverse usernames
function generateDiverseUsername(airdrop: any) {
  const baseSlug = airdrop.slug?.split('-')[0] || airdrop.name.toLowerCase().replace(/\s+/g, '');
  const suffixes = ['official', 'protocol', 'io', 'xyz', 'network', 'labs', 'build', 'dev', 'app', 'finance'];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `@${baseSlug}${Math.random() > 0.5 ? suffix : ''}`;
}

// Generate random post times for variety
function generateRandomPostTime() {
  const hoursAgo = Math.floor(Math.random() * 72); // 0-72 hours ago
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
}

// Generate random engagement metrics
function generateRandomEngagement() {
  return {
    likes: Math.floor(Math.random() * 5000) + 100,
    retweets: Math.floor(Math.random() * 1000) + 50,
    replies: Math.floor(Math.random() * 300) + 10,
    bookmarks: Math.floor(Math.random() * 500) + 20,
    views: Math.floor(Math.random() * 50000) + 5000
  };
}

// Generate varied avatar URLs
function generateRandomAvatar(airdrop: any) {
  const avatarSources = [
    airdrop.avatar_url, // Keep original sometimes
    `https://api.dicebear.com/7.x/shapes/svg?seed=${airdrop.slug}&backgroundColor=random`,
    `https://api.dicebear.com/7.x/identicon/svg?seed=${airdrop.slug}`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=${airdrop.slug}`,
    `https://api.dicebear.com/7.x/pixel-art/svg?seed=${airdrop.slug}`,
    `https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=150&h=150&fit=crop&crop=faces`,
    `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces`
  ];
  return avatarSources[Math.floor(Math.random() * avatarSources.length)];
}

// Diversify requirements display
function diversifyRequirements(requirements: any) {
  if (!requirements) return [];
  
  const variations = [
    // Standard format
    [`${requirements.onchain?.min_transactions || 5} transactions on ${requirements.onchain?.chains?.[0] || 'chain'}`],
    
    // Detailed format
    [
      `Bridge to network (min $${requirements.onchain?.bridge_activity?.min_value_usd || 100})`,
      `Complete ${requirements.onchain?.min_transactions || 5}+ swaps`,
      `Hold position for ${Math.floor(Math.random() * 30) + 7} days`
    ],
    
    // Casual format
    [
      `Bridge some funds over`,
      `Do ${requirements.onchain?.min_transactions || 5}+ transactions`,
      `Follow social accounts`
    ],
    
    // Technical format
    [
      `Execute cross-chain bridge operation`,
      `Maintain ${requirements.onchain?.min_transactions || 5}+ transaction history`,
      `Complete social verification`
    ]
  ];
  
  return variations[Math.floor(Math.random() * variations.length)];
}

// Generate visual variations
function generateVisualVariations() {
  return {
    theme: ['red', 'blue', 'purple', 'green', 'orange'][Math.floor(Math.random() * 5)],
    verified: Math.random() > 0.6,
    hasMedia: Math.random() > 0.7,
    cardStyle: ['gradient', 'solid', 'minimal'][Math.floor(Math.random() * 3)],
    textLength: ['short', 'medium', 'long'][Math.floor(Math.random() * 3)]
  };
}
