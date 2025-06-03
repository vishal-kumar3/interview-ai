"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Maximize } from "lucide-react"

interface FullscreenButtonProps {
  isMobile?: boolean
}

export function FullscreenButton({ isMobile = false }: FullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const requestFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen()
    } catch (error) {
      console.error("Fullscreen error:", error)
    }
  }

  if (isFullscreen) return null

  return (
    <Button
      onClick={requestFullscreen}
      size="sm"
      className={`bg-teal-600 hover:bg-teal-700 text-white border-0 ${
        isMobile ? "w-full" : ""
      }`}
    >
      <Maximize className="w-4 h-4 mr-2" />
      {isMobile ? "Enter Fullscreen" : <span className="hidden sm:inline">Fullscreen</span>}
    </Button>
  )
}
