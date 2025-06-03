"use client"

import { useEffect, useState } from "react"

interface InterviewTimerProps {
  startTime: Date
}

export function InterviewTimer({ startTime }: InterviewTimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime.getTime())
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="text-sm font-medium text-slate-300">
      <span className="hidden sm:inline">Elapsed: </span>
      <span className="font-mono text-white">{formatTime(elapsed)}</span>
    </div>
  )
}
