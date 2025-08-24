"use client"

import { Card } from "@/components/ui/card"

export default function AboutSection() {
  return (
    <section id="about" className="relative min-h-screen py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 font-inter">
            Key
            <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent"> Features</span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Automated protocol engagement and reward consolidation
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Wallet Integration */}
          <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-red-600/5">
            <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center mb-4">
              <div className="w-6 h-6 rounded bg-red-600"></div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 font-inter">Wallet Integration</h3>
            <p className="text-white/70 leading-relaxed">
              Connect your wallet to start automated airdrop participation across multiple protocols.
            </p>
          </Card>

          {/* Protocol Engagement */}
          <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-red-600/5">
            <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center mb-4">
              <div className="w-6 h-6 rounded bg-red-600"></div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 font-inter">Protocol Engagement</h3>
            <p className="text-white/70 leading-relaxed">
              AI agent auto-executes qualifying interactions: swaps, staking, liquidity provision, governance votes.
            </p>
          </Card>

          {/* Telegram Scraping */}
          <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-red-600/5">
            <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center mb-4">
              <div className="w-6 h-6 rounded bg-red-600"></div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 font-inter">Telegram Scraping Agent</h3>
            <p className="text-white/70 leading-relaxed">
              Continuously monitors Telegram for new airdrop announcements and extracts eligibility rules.
            </p>
          </Card>

          {/* Airdrop Tracker */}
          <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-red-600/5">
            <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center mb-4">
              <div className="w-6 h-6 rounded bg-red-600"></div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 font-inter">Airdrop Tracker</h3>
            <p className="text-white/70 leading-relaxed">
              Monitor potential rewards per user and track progress in a comprehensive dashboard.
            </p>
          </Card>

          {/* One-Click Claiming */}
          <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-red-600/5">
            <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center mb-4">
              <div className="w-6 h-6 rounded bg-red-600"></div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 font-inter">One-Click Claiming</h3>
            <p className="text-white/70 leading-relaxed">
              Manual approval for claiming rewards with simplified security and user control.
            </p>
          </Card>

          {/* Gasless Consolidation */}
          <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-red-600/5">
            <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center mb-4">
              <div className="w-6 h-6 rounded bg-red-600"></div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 font-inter">Gasless Consolidation</h3>
            <p className="text-white/70 leading-relaxed">
              Auto-route claimed tokens into a single wallet using relayer services like Biconomy.
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}
