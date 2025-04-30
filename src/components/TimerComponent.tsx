import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Timer, Play, Square } from "lucide-react";
import { useTodo } from "../context/TodoContext";
import { toast } from "../hooks/use-toast";

export default function TimerComponent() {
  const { 
    timerSettings, 
    setTimerSettings, 
    isTimerRunning, 
    setIsTimerRunning,
    currentRecording,
    tasks 
  } = useTodo();
  
  const [timeLeft, setTimeLeft] = useState(timerSettings.duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      toast({
        title: "Timer Started",
        description: `${formatTime(timeLeft)} countdown has begun.`,
      });
    }
  };

  const stopTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      toast({
        title: "Timer Stopped",
        description: "Timer has been stopped.",
      });
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTimeLeft(timerSettings.duration);
    toast({
      title: "Timer Reset",
      description: "Timer has been reset.",
    });
  };

  const handleDurationChange = (value: number[]) => {
    const newDuration = value[0];
    setTimerSettings(prev => ({ ...prev, duration: newDuration }));
    if (!isTimerRunning) {
      setTimeLeft(newDuration);
    }
  };

  const toggleAutoPlay = () => {
    setTimerSettings(prev => ({ 
      ...prev, 
      autoPlayRecording: !prev.autoPlayRecording 
    }));
  };
  
  const playCompleteSound = () => {
    try {
      if (currentRecording && timerSettings.autoPlayRecording) {
        if (!audioRef.current) {
          audioRef.current = new Audio(currentRecording);
        } else {
          audioRef.current.src = currentRecording;
        }
        audioRef.current.play();
      }
    } catch (error) {
      console.error("Error playing recording:", error);
    }
  };

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isTimerRunning && timeLeft === 0) {
      setIsTimerRunning(false);
      toast({
        title: "Timer Complete!",
        description: "Your timer has finished.",
      });
      
      // Play the recording when timer completes
      playCompleteSound();
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerRunning, timeLeft]);

  // Update timeLeft when duration changes and timer isn't running
  useEffect(() => {
    if (!isTimerRunning) {
      setTimeLeft(timerSettings.duration);
    }
  }, [timerSettings.duration, isTimerRunning]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Timer className="mr-2 h-5 w-5" />
          Timer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-6">
          <div className="text-center">
            <div className="text-5xl font-bold tracking-tighter">
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="flex justify-center space-x-2">
            {!isTimerRunning ? (
              <Button onClick={startTimer}>
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopTimer}>
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            )}
            <Button variant="outline" onClick={resetTimer}>
              Reset
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Duration</Label>
                <span>{Math.floor(timerSettings.duration / 60)} minutes</span>
              </div>
              <Slider
                value={[timerSettings.duration]}
                min={60} // 1 minute
                max={3600} // 60 minutes
                step={60}
                onValueChange={handleDurationChange}
                disabled={isTimerRunning}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-play">Auto-play recording when complete</Label>
              <Switch
                id="auto-play"
                checked={timerSettings.autoPlayRecording}
                onCheckedChange={toggleAutoPlay}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
