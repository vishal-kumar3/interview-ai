"use client"

import { Button } from "@/components/ui/button"
import { Mic, Square, Play, Pause } from "lucide-react"
import { AudioRecording, useAudioRecorder } from "@/hooks/use-audio-recorder"

interface AudioRecorderProps {
  isSubmitting: boolean
  onRecordingComplete: (recording: AudioRecording) => void
}

export function AudioRecorder({ isSubmitting, onRecordingComplete }: AudioRecorderProps) {
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioLevel,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    formatTime,
  } = useAudioRecorder()

  const handleRecord = async () => {
    if (isRecording) {
      try {
        const recording = await stopRecording()
        onRecordingComplete(recording)
      } catch (error) {
        console.error("Recording error:", error)
      }
    } else {
      try {
        await startRecording()
      } catch (error) {
        console.error("Start recording error:", error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Audio Response</h3>
        <p className="text-slate-600">Record your response using the microphone</p>
      </div>

      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
        <div className="flex flex-col items-center space-y-4">
          {/* Audio Level Indicator */}
          {isRecording && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-100 ${
                    i < audioLevel * 20 ? "bg-teal-500 h-8" : "bg-slate-300 h-2"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Recording Button */}
          <Button
            onClick={handleRecord}
            disabled={isSubmitting}
            className={`
              w-20 h-20 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105
              ${
                isRecording
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  : "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              }
            `}
          >
            {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </Button>

          {/* Recording Status */}
          <div className="text-center">
            {isRecording ? (
              <div className="space-y-1">
                <p className="text-red-600 font-semibold">Recording...</p>
                <p className="text-slate-600">{formatTime(recordingTime)}</p>
              </div>
            ) : (
              <p className="text-slate-600">Click to start recording</p>
            )}
          </div>

          {/* Pause/Resume Controls */}
          {isRecording && (
            <div className="flex gap-2">
              <Button
                onClick={isPaused ? resumeRecording : pauseRecording}
                variant="outline"
                size="sm"
                className="border-slate-300"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
