"use client"

import { useEffect, useRef } from "react"

interface BackgroundProps {
  color?: "red" | "blue" | "purple"
  className?: string
}

export default function Background({ color = "red", className = "" }: BackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const drawBackground = () => {
      const { width, height } = canvas

      const gradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.3,
        0,
        width * 0.5,
        height * 0.3,
        Math.max(width, height) * 0.8,
      )

      if (color === "red") {
        gradient.addColorStop(0, "rgba(20, 0, 0, 0.1)")
        gradient.addColorStop(0.5, "rgba(10, 0, 0, 0.3)")
        gradient.addColorStop(1, "rgba(0, 0, 0, 1)")
      } else if (color === "blue") {
        gradient.addColorStop(0, "rgba(0, 100, 200, 0.3)")
        gradient.addColorStop(0.3, "rgba(0, 50, 100, 0.4)")
        gradient.addColorStop(0.6, "rgba(0, 25, 50, 0.6)")
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.95)")
      } else {
        gradient.addColorStop(0, "rgba(100, 0, 200, 0.3)")
        gradient.addColorStop(0.3, "rgba(50, 0, 100, 0.4)")
        gradient.addColorStop(0.6, "rgba(25, 0, 50, 0.6)")
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.95)")
      }

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }

    resizeCanvas()
    drawBackground()

    window.addEventListener("resize", () => {
      resizeCanvas()
      drawBackground()
    })

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [color])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{ background: "#000000" }}
    />
  )
}
