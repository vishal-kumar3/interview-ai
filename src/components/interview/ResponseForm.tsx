"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { FileText, Mic, ChevronRight } from "lucide-react"
import { useForm } from "react-hook-form"
import { AudioRecording } from "@/hooks/use-audio-recorder"
import { AudioRecorder } from "./AudioRecorder"
import { saveBlobToLocal } from "@/utils/upload"

interface ResponseFormProps {
  isSubmitting: boolean
  onSubmitResponse: (
    textResponse: string,
    audioResponse?: {
      audio: AudioRecording,
      filePath: string,
    }
  ) => void
  onEndInterview: () => void
}

export function ResponseForm({ isSubmitting, onSubmitResponse, onEndInterview }: ResponseFormProps) {
  const [responseType, setResponseType] = useState<"text" | "audio">("text")
  const [audioRecording, setAudioRecording] = useState<AudioRecording | null>(null)

  const form = useForm({
    defaultValues: {
      response: "",
    },
  })

  const handleSubmit = (data: { response: string }) => {
    onSubmitResponse(data.response)
  }

  const handleAudioSubmit = async () => {
    console.log("Submitting audio response:", audioRecording, audioRecording?.blob)
    const filePath = await saveBlobToLocal(audioRecording?.blob, "")
    if (!audioRecording || !filePath) {
      return console.error("No audio recording or file path available")
    }

    onSubmitResponse("", {audio: audioRecording, filePath: filePath})
  }

  return (
    <Card className="shadow-xl bg-white/95 backdrop-blur-sm border-0 sticky bottom-4 sm:static">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <Tabs value={responseType} onValueChange={(value) => setResponseType(value as "text" | "audio")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Text Response
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Audio Response
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="response"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold text-lg">Your Response</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Type your detailed response here..."
                          className="min-h-[150px] sm:min-h-[200px] text-base leading-relaxed border-slate-200 focus:border-teal-500 focus:ring-teal-500 resize-none bg-slate-50 focus:bg-white transition-colors"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !form.watch("response")?.trim()}
                    className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 sm:px-8 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 order-1"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Response
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onEndInterview}
                    className="border-slate-300 text-slate-600 hover:bg-slate-50 px-6 py-3 rounded-xl order-2"
                  >
                    End Interview
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="audio" className="space-y-6">
            <AudioRecorder
              isSubmitting={isSubmitting}
              onRecordingComplete={setAudioRecording}
            />

            {/* Submit Button for Audio */}
            {audioRecording && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleAudioSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-8 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Audio Response
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onEndInterview}
                  className="border-slate-300 text-slate-600 hover:bg-slate-50 px-6 py-3 rounded-xl"
                >
                  End Interview
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
