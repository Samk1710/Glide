"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, TrendingUp, Wallet, Star, Clock, ChevronRight } from "lucide-react"
import Header from "@/components/Header"
import Background from "@/components/Background"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MagicTweet } from "@/components/magicui/tweet-card"

interface Airdrop {
  id: string
  title: string
  description: string
  requirements: string[]
  reward: string
  deadline: string
  difficulty: "Easy" | "Medium" | "Hard"
  status: "Active" | "Upcoming" | "Ended"
  chain: string
  image?: string
  category: string
  participants: number
  estimatedValue: string
  projectTwitter: string
  website: string
}

// Mock tweet data for MagicTweet components
const createTweetData = (airdrop: Airdrop) => {
  const tweetText = `🚀 ${airdrop.title}\n\n${airdrop.description}\n\n💰 Reward: ${airdrop.reward}\n⏰ Deadline: ${airdrop.deadline}\n🔗 Chain: ${airdrop.chain}\n\n#Airdrop #Crypto #${airdrop.chain}`;
  
  return {
    __typename: "Tweet" as const,
    id: airdrop.id,
    id_str: airdrop.id,
    text: tweetText,
    user: {
      __typename: "User" as const,
      id: airdrop.id,
      id_str: airdrop.id,
      name: airdrop.title,
      screen_name: airdrop.projectTwitter.replace('@', ''),
      profile_image_url_https: airdrop.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${airdrop.id}`,
      verified: Math.random() > 0.5,
      verified_type: Math.random() > 0.5 ? "blue" : undefined,
      followers_count: Math.floor(Math.random() * 100000),
      following_count: Math.floor(Math.random() * 1000),
      profile_banner_url: undefined,
      description: `Official ${airdrop.title} account`,
      location: undefined,
      url: airdrop.website,
      protected: false
    },
    created_at: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    favorite_count: Math.floor(Math.random() * 5000),
    retweet_count: Math.floor(Math.random() * 1000),
    reply_count: Math.floor(Math.random() * 200),
    quote_count: Math.floor(Math.random() * 100),
    conversation_count: Math.floor(Math.random() * 300),
    news_action_type: "conversation" as const,
    isEdited: false,
    isStaleEdit: false,
    editable_until_msecs: undefined,
    edits_remaining: undefined,
    is_translatable: false,
    views: {
      count: Math.floor(Math.random() * 50000).toString(),
      state: "Enabled" as const
    },
    bookmarks: {
      count: Math.floor(Math.random() * 500)
    },
    retweeted: false,
    favorited: false,
    full_text: tweetText,
    display_text_range: [0, tweetText.length] as [number, number],
    entities: {
      hashtags: [
        { indices: [0, 8] as [number, number], text: "Airdrop" },
        { indices: [9, 16] as [number, number], text: "Crypto" },
        { indices: [17, 17 + airdrop.chain.length] as [number, number], text: airdrop.chain }
      ],
      urls: airdrop.website ? [{ 
        indices: [0, 23] as [number, number], 
        url: airdrop.website, 
        display_url: new URL(airdrop.website).hostname,
        expanded_url: airdrop.website 
      }] : [],
      user_mentions: [],
      symbols: []
    },
    extended_entities: undefined,
    possibly_sensitive: false,
    lang: "en",
    edit_control: {
      edit_tweet_ids: [airdrop.id],
      editable_until_msecs: Date.now() + 1800000,
      is_edit_eligible: false,
      edits_remaining: 0
    }
  } as any; // Type assertion to avoid complex type issues
}

export default function AirdropsPage() {
  const [airdrops, setAirdrops] = useState<Airdrop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Upcoming" | "Ended">("All")
  const [filterChain, setFilterChain] = useState<string>("All")

  // Mock data for right sidebar
  const [walletBalance] = useState("$12,485.67")
  const [claimableAirdrops] = useState(3)
  const [recentProtocols] = useState([
    { name: "Uniswap V4", status: "Completed", reward: "$125" },
    { name: "Arbitrum", status: "Pending", reward: "$89" },
    { name: "Optimism", status: "Claimed", reward: "$156" }
  ])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) return `${diffInHours}h`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d`
  }

  const fetchAirdrops = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/airdrops')
      const data = await response.json()
      console.log('API Response:', data)
      
      if (data.airdrops) {
        // Map API data to our expected Airdrop interface
        const mappedAirdrops: Airdrop[] = data.airdrops.map((item: any) => ({
          id: item._id.toString(),
          title: item.name,
          description: item.tweet_content || `Participate in ${item.name} airdrop on ${item.primary_chain}. Estimated value: $${item.estimates?.expected_value_usd_range?.[0] || 200}-$${item.estimates?.expected_value_usd_range?.[1] || 800}`,
          requirements: [
            `Minimum ${item.requirements?.onchain?.min_transactions || 5} transactions`,
            `Bridge activity on ${item.primary_chain}`,
            `Follow ${item.username || '@project'} on Twitter`,
            ...(item.requirements?.onchain?.required_tx_types || []).map((type: string) => `Perform ${type} operations`)
          ].slice(0, 4),
          reward: `${item.allocation?.total_pool_tokens ? Math.floor(item.allocation.total_pool_tokens / 1000000) + 'M' : '100M'} ${item.allocation?.token_ticker || 'TOKEN'}`,
          deadline: new Date(item.timeline?.expected_claim_window?.start || Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          difficulty: item.estimates?.probability === 'high' ? 'Easy' : item.estimates?.probability === 'medium' ? 'Medium' : 'Hard' as 'Easy' | 'Medium' | 'Hard',
          status: item.sources?.evidence_level === 'confirmed' ? 'Active' : item.sources?.evidence_level === 'strong' ? 'Upcoming' : 'Active' as 'Active' | 'Upcoming' | 'Ended',
          chain: item.primary_chain,
          image: item.image_url || item.avatar_url,
          category: item.category,
          participants: Math.floor(Math.random() * 50000) + 10000,
          estimatedValue: `$${item.estimates?.expected_value_usd_range?.[0] || 200}-$${item.estimates?.expected_value_usd_range?.[1] || 800}`,
          projectTwitter: item.username || `@${item.slug?.split('-')[0] || 'project'}`,
          website: item.links?.website || '#'
        }))
        
        setAirdrops(mappedAirdrops)
        console.log('Mapped airdrops:', mappedAirdrops)
      }
    } catch (error) {
      console.error('Failed to fetch airdrops:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAirdrops()
  }, [])

  // Filter and search airdrops
  const filteredAirdrops = airdrops.filter(airdrop => {
    const matchesSearch = airdrop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         airdrop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         airdrop.chain.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "All" || airdrop.status === filterStatus
    const matchesChain = filterChain === "All" || airdrop.chain === filterChain
    
    return matchesSearch && matchesStatus && matchesChain
  })

  const chains = Array.from(new Set(airdrops.map(a => a.chain)))

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900">
      {/* Background Component */}
      <Background color="red" />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="pt-24 px-6 max-w-7xl mx-auto pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Feed - Takes 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {/* Dashboard Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-red-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl border border-red-500/20 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <TrendingUp className="text-red-400" />
                  Airdrop Dashboard
                </h1>
                <Button 
                  onClick={fetchAirdrops}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  disabled={loading}
                >
                  {loading ? "Refreshing..." : "Refresh Feed"}
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-red-400 text-sm">Total Airdrops</div>
                  <div className="text-2xl font-bold text-white">{airdrops.length}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-orange-400 text-sm">Active</div>
                  <div className="text-2xl font-bold text-white">
                    {airdrops.filter(a => a.status === "Active").length}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-yellow-400 text-sm">Claimable</div>
                  <div className="text-2xl font-bold text-white">{claimableAirdrops}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-green-400 text-sm">Est. Value</div>
                  <div className="text-2xl font-bold text-white">$2.4K</div>
                </div>
              </div>
            </motion.div>

            {/* Search and Filter Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search airdrops..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ended">Ended</option>
                  </select>
                  
                  <select
                    value={filterChain}
                    onChange={(e) => setFilterChain(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                  >
                    <option value="All">All Chains</option>
                    {chains.map(chain => (
                      <option key={chain} value={chain}>{chain}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Results Count */}
              <div className="mt-4 text-sm text-white/60">
                Showing {filteredAirdrops.length} of {airdrops.length} airdrops
              </div>
            </motion.div>

            {/* Airdrop Feed - Using MagicTweet Cards */}
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-white/60 mt-4">Loading airdrops...</p>
                </div>
              ) : filteredAirdrops.length > 0 ? (
                filteredAirdrops.map((airdrop, index) => (
                  <motion.div
                    key={airdrop.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group mb-8"
                  >
                    {/* Tweet Card Container with red theme */}
                    <div className="bg-gradient-to-br from-red-950/40 to-red-900/30 backdrop-blur-sm rounded-2xl border border-red-500/30 hover:border-red-400/50 transition-all duration-300 overflow-hidden shadow-2xl">
                      <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-xl border border-red-500/20 m-2">
                        {/* MagicTweet Component */}
                        <div className="overflow-hidden rounded-xl">
                          <MagicTweet 
                            tweet={createTweetData(airdrop)}
                            className="!bg-gradient-to-br !from-gray-900/90 !to-gray-800/90 !border-red-500/20 !backdrop-blur-sm max-w-none w-full"
                          />
                        </div>
                        
                        {/* Additional Airdrop Info Overlay */}
                        <div className="px-6 pb-6 border-t border-red-500/10 bg-gradient-to-r from-red-950/30 to-orange-950/20">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div>
                              <h4 className="text-red-400 font-semibold mb-3 text-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                Requirements:
                              </h4>
                              <ul className="space-y-2">
                                {airdrop.requirements.slice(0, 4).map((req, idx) => (
                                  <li key={idx} className="text-white/80 text-sm flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                                    <span>{req}</span>
                                  </li>
                                ))}
                                {airdrop.requirements.length > 4 && (
                                  <li className="text-red-400 text-xs ml-4 opacity-70">+{airdrop.requirements.length - 4} more requirements</li>
                                )}
                              </ul>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-red-500/20">
                                <span className="text-white/70 text-sm">💰 Reward:</span>
                                <span className="text-orange-400 font-bold text-sm">{airdrop.reward}</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-red-500/20">
                                <span className="text-white/70 text-sm">⏰ Deadline:</span>
                                <span className="text-white font-medium text-sm">{airdrop.deadline}</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-red-500/20">
                                <span className="text-white/70 text-sm">💎 Est. Value:</span>
                                <span className="text-green-400 font-bold text-sm">{airdrop.estimatedValue}</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-red-500/20">
                                <span className="text-white/70 text-sm">👥 Participants:</span>
                                <span className="text-blue-400 font-medium text-sm">{airdrop.participants.toLocaleString()}</span>
                              </div>
                              
                              <div className="flex items-center justify-between gap-2 pt-2">
                                <div className="flex gap-2">
                                  <Badge variant="outline" className="border-red-500/40 text-red-400 text-xs px-2 py-1">
                                    🔗 {airdrop.chain}
                                  </Badge>
                                  <Badge 
                                    variant={airdrop.status === "Active" ? "default" : "secondary"}
                                    className={`text-xs px-2 py-1 ${airdrop.status === "Active" ? "bg-green-500/20 text-green-400 border-green-500/40" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"}`}
                                  >
                                    {airdrop.status === "Active" ? "🟢" : "🟡"} {airdrop.status}
                                  </Badge>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs px-2 py-1 ${
                                    airdrop.difficulty === "Easy" ? "border-green-500/40 text-green-400" :
                                    airdrop.difficulty === "Medium" ? "border-yellow-500/40 text-yellow-400" :
                                    "border-red-500/40 text-red-400"
                                  }`}
                                >
                                  {airdrop.difficulty === "Easy" ? "🟢" : airdrop.difficulty === "Medium" ? "🟡" : "🔴"} {airdrop.difficulty}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-6 border-t border-red-500/10 mt-4">
                            <Button 
                              size="lg"
                              className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                              disabled={airdrop.status === "Ended"}
                            >
                              {airdrop.status === "Active" ? "🚀 Participate Now" : 
                               airdrop.status === "Upcoming" ? "🔔 Set Reminder" : "❌ Ended"}
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button 
                              size="lg" 
                              variant="outline" 
                              className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-400/60 px-4 shadow-lg"
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="lg" 
                              variant="outline" 
                              className="border-orange-500/40 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400/60 px-4 shadow-lg"
                            >
                              📊
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-white/60">No airdrops found matching your criteria.</p>
                  <Button 
                    onClick={fetchAirdrops}
                    className="mt-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  >
                    Refresh Feed
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Wallet Balance */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wallet className="text-red-400 w-5 h-5" />
                    Wallet Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white mb-2">{walletBalance}</div>
                  <div className="text-green-400 text-sm">+2.4% today</div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Claimable Airdrops */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="text-orange-400 w-5 h-5" />
                    Claimable
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white mb-2">{claimableAirdrops}</div>
                  <Button size="sm" className="w-full bg-gradient-to-r from-orange-500 to-red-500">
                    Claim All
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Protocols */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="text-blue-400 w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentProtocols.map((protocol, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <div className="text-white font-medium text-sm">{protocol.name}</div>
                        <div className="text-white/60 text-xs">{protocol.status}</div>
                      </div>
                      <div className="text-green-400 font-semibold text-sm">{protocol.reward}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Trading Performance */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="text-green-400 w-5 h-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60 text-sm">Total Claimed</span>
                    <span className="text-white font-semibold">$4,280</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60 text-sm">Success Rate</span>
                    <span className="text-green-400 font-semibold">87%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60 text-sm">Avg. Reward</span>
                    <span className="text-white font-semibold">$142</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
