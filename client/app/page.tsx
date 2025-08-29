"use client"

import { useRef } from "react"
import Background from "@/components/Background"
import Header from "@/components/Header"
import HeroSection from "@/components/HeroSection"
import AboutSection from "@/components/AboutSection"

export default function Home() {
  const aboutRef = useRef<HTMLDivElement>(null)

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Background Component */}
      <Background color="red" />

      {/* Header */}
      <Header />

      {/* Hero Section with proper top padding to account for sticky navbar */}
      <div className="pt-20">
        <HeroSection onLearnMore={scrollToAbout} />
      </div>

      {/* About Section */}
      <div ref={aboutRef}>
        <AboutSection />
      </div>
    </main>
  )
}
