import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Task, TimerSettings } from "../types";
import { toast } from "../hooks/use-toast";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface TodoContextProps {
  tasks: Task[];
  addTask: (title: string, recording?: string, dueDate?: Date, dueTime?: string) => void;
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, title: string) => void;
  updateTaskDueTime: (id: string, dueTime: string) => void;
  updateTaskDueDate: (id: string, dueDate: Date) => void;
  timerSettings: TimerSettings;
  setTimerSettings: React.Dispatch<React.SetStateAction<TimerSettings>>;
  isTimerRunning: boolean;
  setIsTimerRunning: React.Dispatch<React.SetStateAction<boolean>>;
  currentRecording: string | null;
  setCurrentRecording: React.Dispatch<React.SetStateAction<string | null>>;
}

const TodoContext = createContext<TodoContextProps | undefined>(undefined);

export function TodoProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Load from localStorage initially
    const stored = localStorage.getItem("tasks");
    return stored ? JSON.parse(stored) : [];
  });

  // Save to localStorage on every change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    duration: 300,
    autoPlayRecording: true,
  });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(null);
  const [alarmSound] = useState<HTMLAudioElement | null>(() =>
    typeof window !== "undefined"
      ? new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3")
      : null
  );

  const [notifiedTasks] = useState<Set<string>>(new Set());

  const addTask = (title: string, recording?: string, dueDate?: Date, dueTime?: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      recording,
      timestamp: Date.now(),
      dueDate,
      dueTime,
    };
    setTasks((prev) => [...prev, newTask]);

    let description = "Your task has been added successfully!";
    if (dueDate) {
      description = `Task due on ${format(dueDate, "PPP")}${dueTime ? ` at ${dueTime}` : ""}`;
    } else if (dueTime) {
      description = `Task due at ${dueTime}`;
    }

    toast({
      title: "Task Added",
      description,
    });
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    toast({
      title: "Task Deleted",
      description: "Your task has been removed.",
      variant: "destructive",
    });
  };

  const editTask = (id: string, title: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, title } : task)));
    toast({
      title: "Task Updated",
      description: "Your task has been updated successfully!",
    });
  };

  const updateTaskDueTime = (id: string, dueTime: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, dueTime } : task))
    );
    toast({
      title: "Due Time Set",
      description: `Task due time set to ${dueTime}`,
    });
  };

  const updateTaskDueDate = (id: string, dueDate: Date) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, dueDate } : task))
    );
    toast({
      title: "Due Date Set",
      description: `Task due date set to ${format(dueDate, "PPP")}`,
    });
  };

  const stopAudio = () => {
    if (playingAudio) {
      playingAudio.pause();
      playingAudio.currentTime = 0;
      setPlayingAudio(null);
    }
  };

  const checkDueTasks = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    tasks.forEach((task) => {
      if (task.completed || notifiedTasks.has(task.id)) return;

      const isDueToday = task.dueDate
        ? new Date(task.dueDate).toDateString() === currentDate.toDateString()
        : true;

      const isTimeMatching = task.dueTime === currentTime;

      if (isDueToday && isTimeMatching) {
        notifiedTasks.add(task.id);

        let audio: HTMLAudioElement;
        if (task.recording) {
          audio = new Audio(task.recording);
        } else if (alarmSound) {
          audio = alarmSound.cloneNode(true) as HTMLAudioElement;
        } else {
          return;
        }

        audio.loop = true;
        audio.play().catch((err) => console.error("Error playing audio:", err));
        setPlayingAudio(audio);

        toast({
          title: "Alarm",
          description: "Task is due!",
          action: (
            <Button onClick={stopAudio} variant="destructive">
              Stop Alarm
            </Button>
          ),
        });
      }
    });
  };

  useEffect(() => {
    checkDueTasks();
    const intervalId = setInterval(checkDueTasks, 5000);
    return () => clearInterval(intervalId);
  }, [tasks]);

  return (
    <TodoContext.Provider
      value={{
        tasks,
        addTask,
        toggleTaskCompletion,
        deleteTask,
        editTask,
        updateTaskDueTime,
        updateTaskDueDate,
        timerSettings,
        setTimerSettings,
        isTimerRunning,
        setIsTimerRunning,
        currentRecording,
        setCurrentRecording,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodo() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error("useTodo must be used within a TodoProvider");
  }
  return context;
}
