"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

interface SecurityOptions {
  sessionId: string
  onMalpractice: (type: string) => void
  onTerminate: () => void
}

export function useSecurity({ sessionId, onMalpractice, onTerminate }: SecurityOptions) {
  const [malpracticeCount, setMalpracticeCount] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const router = useRouter()
  const warningShown = useRef(false)

  useEffect(() => {
    // Request fullscreen on mount
    const requestFullscreenOnMount = async () => {
      try {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } catch (error) {
        console.warn("Fullscreen not supported or denied")
      }
    }

    requestFullscreenOnMount()

    // Fullscreen change detection
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement
      setIsFullscreen(isCurrentlyFullscreen)

      if (!isCurrentlyFullscreen && !warningShown.current) {
        handleMalpractice("fullscreen_exit")
      }
    }

    // Tab visibility detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleMalpractice("tab_switch")
      }
    }

    // Window focus detection
    const handleBlur = () => {
      handleMalpractice("focus_loss")
    }

    // Mouse leave detection
    const handleMouseLeave = () => {
      handleMalpractice("mouse_leave")
    }

    // Prevent right-click and common shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+U, etc.
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.key === "PrintScreen")
      ) {
        e.preventDefault()
        handleMalpractice("dev_tools_attempt")
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // Add event listeners
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("blur", handleBlur)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("contextmenu", handleContextMenu)

    return () => {
      // Cleanup
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("blur", handleBlur)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [])

  const handleMalpractice = (type: string) => {
    const newCount = malpracticeCount + 1
    setMalpracticeCount(newCount)
    onMalpractice(type)

    if (newCount === 1) {
      // toast({
      //   title: "Warning",
      //   description: "Please stay focused. Further violations will end the interview.",
      //   variant: "destructive",
      // })
      warningShown.current = true
    } else if (newCount >= 2) {
      // toast({
      //   title: "Interview Terminated",
      //   description: "Session ended due to multiple security violations.",
      //   variant: "destructive",
      // })
      onTerminate()
    }
  }

  const requestFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } catch (error) {
      console.warn("Fullscreen request failed:", error)
    }
  }

  return {
    malpracticeCount,
    isFullscreen,
    handleMalpractice,
    requestFullscreen,
  }
}
