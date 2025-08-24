"use client"

import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white/20 backdrop-blur-sm"></div>
            </div>
            <span className="text-xl font-bold text-white font-inter">Ethereal Web3</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-white/80 hover:text-white transition-colors">
              Home
            </a>
            <a href="#about" className="text-white/80 hover:text-white transition-colors">
              About
            </a>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              Connect Wallet
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
