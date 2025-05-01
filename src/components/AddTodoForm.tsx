import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Clock, Mic, MicOff, Volume2 } from "lucide-react";
import { useTodo } from "../context/TodoContext";
import VoiceRecorder from "./VoiceRecorder";
import { DatePicker } from "./DatePicker";

export default function AddTodoForm() {
  const { addTask } = useTodo();
  const [title, setTitle] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showRecorder, setShowRecorder] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState("default");

  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  const alarmTones = [
    { label: "Default", value: "default" },
    { label: "Chime", value: "chime", src: "/tones/chime.mp3" },
    { label: "Bell", value: "bell", src: "/tones/bell.mp3" },
    { label: "Soft Ping", value: "ping", src: "/tones/ping.mp3" },
    { label: "Beep", value: "beep", src: "/tones/beep.mp3" },
  ];

  const handlePlayTone = (toneValue: string) => {
    const audio = audioRefs.current[toneValue];
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addTask(
        title,
        currentRecording || undefined,
        dueDate,
        dueTime || undefined,
        selectedTone
      );
      setTitle("");
      setDueTime("");
      setDueDate(undefined);
      setCurrentRecording(null);
      setShowRecorder(false);
      setSelectedTone("default");
    }
  };

  const handleRecordingComplete = (audioUrl: string) => {
    setCurrentRecording(audioUrl);
  };

  return (
    <Card className="mb-6 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-background border-purple-200 dark:border-purple-800/30 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-primary">
          <Plus className="mr-2 h-5 w-5" />
          Add New Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-3">
            <Input
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-grow border-purple-200 dark:border-purple-800/30 focus-visible:ring-primary"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex-1">
                <DatePicker date={dueDate} onSelect={setDueDate} />
              </div>
              <div className="flex items-center relative">
                <Clock className="absolute left-3 h-4 w-4 text-primary pointer-events-none" />
                <Input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="pl-10 border-purple-200 dark:border-purple-800/30 focus-visible:ring-primary w-full"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-primary mb-1">
                  Select Alarm Tone
                </label>
                <div className="space-y-2">
                  {alarmTones.map((tone) => (
                    <div
                      key={tone.value}
                      className="flex items-center justify-between bg-white dark:bg-transparent border border-purple-200 dark:border-purple-800/30 px-3 py-2 rounded-md"
                    >
                      <label className="flex items-center gap-2 text-sm cursor-pointer w-full">
                        <input
                          type="radio"
                          value={tone.value}
                          checked={selectedTone === tone.value}
                          onChange={() => setSelectedTone(tone.value)}
                          className="accent-purple-500"
                        />
                        {tone.label}
                      </label>
                      {tone.src && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePlayTone(tone.value)}
                          >
                            <Volume2 className="h-4 w-4 text-primary" />
                          </Button>
                          <audio
                            ref={(el) => (audioRefs.current[tone.value] = el)}
                            src={tone.src}
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRecorder(!showRecorder)}
              className="bg-white dark:bg-transparent border-purple-200 dark:border-purple-800/30 hover:bg-purple-100 dark:hover:bg-purple-900/20"
            >
              {showRecorder ? (
                <>
                  <MicOff className="mr-2 h-4 w-4 text-red-500" />
                  <span>Hide Recorder</span>
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4 text-primary" />
                  <span>Add Voice Note</span>
                </>
              )}
            </Button>

            <Button
              type="submit"
              disabled={!title.trim()}
              className="bg-primary hover:bg-primary/90 flex-grow"
            >
              Add Task
            </Button>
          </div>

          {currentRecording && (
            <div className="text-sm text-primary flex items-center justify-center bg-purple-100 dark:bg-purple-900/20 p-2 rounded-md">
              <Mic className="h-4 w-4 mr-2" />
              Voice note attached
            </div>
          )}

          {showRecorder && (
            <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
          )}
        </form>
      </CardContent>
    </Card>
  );
}
