
import React, { useState, useRef } from "react";
import { Task } from "../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Edit, Trash, Play, Square, Clock, Calendar } from "lucide-react";
import { useTodo } from "../context/TodoContext";
import { format } from "date-fns";

interface TodoItemProps {
  task: Task;
}

export default function TodoItem({ task }: TodoItemProps) {
  const { toggleTaskCompletion, deleteTask, editTask } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleUpdate = () => {
    // Don't allow empty titles
    if (editedTitle.trim() !== "") {
      editTask(task.id, editedTitle);
      setIsEditing(false);
    }
  };

  const playRecording = () => {
    if (task.recording) {
      if (!audioRef.current) {
        audioRef.current = new Audio(task.recording);
        audioRef.current.onended = () => setIsPlaying(false);
      } else {
        audioRef.current.src = task.recording;
      }
      
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const formatDueInfo = () => {
    let dueInfo = "";
    
    if (task.dueDate) {
      dueInfo += format(new Date(task.dueDate), "MMM d, yyyy");
    }
    
    if (task.dueTime) {
      dueInfo += (dueInfo ? " at " : "") + task.dueTime;
    }
    
    return dueInfo;
  };

  return (
    <Card className={`mb-3 transition-all duration-300 hover:shadow-md ${task.completed ? "opacity-70" : ""} bg-gradient-to-r from-white to-purple-50 dark:from-background dark:to-purple-900/10 border-purple-100 dark:border-purple-800/20`}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-grow">
          <Checkbox 
            checked={task.completed}
            onCheckedChange={() => toggleTaskCompletion(task.id)}
            className="h-5 w-5 border-purple-300 dark:border-purple-700"
          />
          
          {isEditing ? (
            <div className="flex-grow mr-2">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleUpdate}
                onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                className="flex-grow"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex-grow flex flex-col">
              <span className={`${task.completed ? "line-through text-muted-foreground" : "font-medium"}`}>
                {task.title}
              </span>
              {(task.dueDate || task.dueTime) && (
                <div className="text-xs text-muted-foreground flex items-center mt-1 space-x-2">
                  {task.dueDate && (
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-primary/70" />
                      {format(new Date(task.dueDate), "MMM d, yyyy")}
                    </span>
                  )}
                  {task.dueTime && (
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-primary/70" />
                      {task.dueTime}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex space-x-1">
          {task.recording && (
            isPlaying ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={stopPlayback}
                className="h-8 w-8 p-0 text-primary hover:bg-purple-100 dark:hover:bg-purple-900/20"
                title="Stop"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={playRecording}
                className="h-8 w-8 p-0 text-primary hover:bg-purple-100 dark:hover:bg-purple-900/20"
                title="Play Recording"
              >
                <Play className="h-4 w-4" />
              </Button>
            )
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="h-8 w-8 p-0 text-primary hover:bg-purple-100 dark:hover:bg-purple-900/20"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteTask(task.id)}
            className="h-8 w-8 p-0 text-destructive hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
