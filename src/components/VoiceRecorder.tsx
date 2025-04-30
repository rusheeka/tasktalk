
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Play, Square } from "lucide-react";
import { toast } from "../hooks/use-toast";

interface VoiceRecorderProps {
  onRecordingComplete: (audioUrl: string) => void;
}

export default function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setRecordingTime(0);
      
      // Start timer for recording duration
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        // Clear the timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordingUrl(audioUrl);
        onRecordingComplete(audioUrl);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Voice recording in progress...",
      });
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop all audio tracks in the stream
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      setIsRecording(false);
      toast({
        title: "Recording Completed",
        description: "Voice recording saved successfully!",
      });
    }
  };

  const playRecording = () => {
    if (recordingUrl) {
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio(recordingUrl);
        audioElementRef.current.onended = () => {
          setIsPreviewing(false);
        };
      } else {
        audioElementRef.current.src = recordingUrl;
      }
      
      audioElementRef.current.play();
      setIsPreviewing(true);
    }
  };

  const stopPlayback = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      setIsPreviewing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="mb-6 overflow-hidden bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/10 border-purple-200 dark:border-purple-800/30">
      <CardContent className="p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-100 animate-pulse-recording shadow-lg shadow-red-200 dark:shadow-red-900/20' : 'bg-purple-100 dark:bg-purple-900/20'}`}>
            {isRecording ? (
              <Mic className="h-8 w-8 text-red-500" />
            ) : (
              <Mic className="h-8 w-8 text-primary" />
            )}
          </div>
          
          {isRecording && (
            <div className="text-sm font-medium text-primary">
              Recording: {formatTime(recordingTime)}
            </div>
          )}
          
          <div className="flex space-x-2">
            {isRecording ? (
              <Button 
              type="button"
              variant="destructive" 
              onClick={stopRecording}
              className="shadow-md hover:shadow-lg transition-all duration-200"
            >
            
                <MicOff className="mr-2 h-4 w-4" />
                Stop Recording
              </Button>
            ) : (
              <Button 
                type="button"
                variant="default" 
                onClick={startRecording}
                className="bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200"
              >

                <Mic className="mr-2 h-4 w-4" />
                Start Recording
              </Button>
            )}
            
            {recordingUrl && !isPreviewing ? (
              <Button 
                variant="outline" 
                onClick={playRecording}
                disabled={isRecording}
                className="border-purple-200 dark:border-purple-800/30 bg-white/50 dark:bg-white/5 hover:bg-purple-100 dark:hover:bg-purple-900/30"
              >
                <Play className="mr-2 h-4 w-4" />
                Play
              </Button>
            ) : recordingUrl && isPreviewing ? (
              <Button 
                variant="outline" 
                onClick={stopPlayback}
                className="border-purple-200 dark:border-purple-800/30 bg-white/50 dark:bg-white/5 hover:bg-purple-100 dark:hover:bg-purple-900/30"
              >
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
