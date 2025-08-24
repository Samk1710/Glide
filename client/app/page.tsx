"use client"

import { useRef } from "react"
import Background from "@/components/Background"
import Header from "@/components/Header"
import HeroSection from "@/components/HeroSection"
import AboutSection from "@/components/AboutSection"

export default function Home() {
  const aboutRef = useRef<HTMLElement>(null)

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

      {/* Hero Section */}
      <HeroSection onLearnMore={scrollToAbout} />

      {/* About Section */}
      <div ref={aboutRef}>
        <AboutSection />
      </div>
    </main>
  )
}
