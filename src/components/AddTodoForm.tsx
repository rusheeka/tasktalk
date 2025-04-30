
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Clock, Mic, MicOff, Calendar } from "lucide-react";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim()) {
      addTask(title, currentRecording || undefined, dueDate, dueTime || undefined);
      setTitle("");
      setDueTime("");
      setDueDate(undefined);
      setCurrentRecording(null);
      setShowRecorder(false);
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
                <DatePicker 
                  date={dueDate}
                  onSelect={setDueDate}
                />
              </div>
              <div className="flex items-center relative">
                <Clock className="absolute left-3 h-4 w-4 text-primary pointer-events-none" />
                <Input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="pl-10 border-purple-200 dark:border-purple-800/30 focus-visible:ring-primary w-full"
                  placeholder="Set time"
                />
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
