import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Task, TimerSettings } from "../types";
import { toast } from "../hooks/use-toast";
import { format } from "date-fns";

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    duration: 300, // 5 minutes by default
    autoPlayRecording: true,
  });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<string | null>(null);
  const [alarmSound] = useState<HTMLAudioElement | null>(() => 
    typeof window !== 'undefined' 
      ? new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3") 
      : null
  );
  
  // Keep track of already notified tasks to prevent duplicate notifications
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
    setTasks([...tasks, newTask]);
    
    let description = "Your task has been added successfully!";
    if (dueDate) {
      description = `Task due on ${format(dueDate, 'PPP')}${dueTime ? ` at ${dueTime}` : ''}`;
    } else if (dueTime) {
      description = `Task due at ${dueTime}`;
    }
    
    toast({
      title: "Task Added",
      description,
    });
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    toast({
      title: "Task Deleted",
      description: "Your task has been removed.",
      variant: "destructive",
    });
  };

  const editTask = (id: string, title: string) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, title } : task))
    );
    toast({
      title: "Task Updated",
      description: "Your task has been updated successfully!",
    });
  };

  const updateTaskDueTime = (id: string, dueTime: string) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, dueTime } : task))
    );
    toast({
      title: "Due Time Set",
      description: `Task due time set to ${dueTime}`,
    });
  };

  const updateTaskDueDate = (id: string, dueDate: Date) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, dueDate } : task))
    );
    toast({
      title: "Due Date Set",
      description: `Task due date set to ${format(dueDate, 'PPP')}`,
    });
  };

  // Function to check for due tasks
  const checkDueTasks = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    tasks.forEach(task => {
      if (task.completed) return; // Skip completed tasks
      
      // Check if the task is due today and at the current time
      const isDueToday = task.dueDate ? 
        new Date(task.dueDate).getFullYear() === currentDate.getFullYear() &&
        new Date(task.dueDate).getMonth() === currentDate.getMonth() &&
        new Date(task.dueDate).getDate() === currentDate.getDate()
        : true; // If no due date, treat as due today
      
      const isTimeMatching = task.dueTime === currentTime;
      
      if (isDueToday && isTimeMatching && !notifiedTasks.has(task.id)) {
        console.log(`Task due now: ${task.title} at ${currentTime}`);
        
        // Mark this task as notified
        notifiedTasks.add(task.id);
        
        // Play recording if available, otherwise play alarm sound
        if (task.recording) {
          console.log("Playing task recording");
          const audio = new Audio(task.recording);
          audio.play().catch(err => console.error("Error playing recording:", err));
        } else if (alarmSound) {
          console.log("Playing alarm sound");
          alarmSound.play().catch(err => console.error("Error playing alarm:", err));
        }
        
        // Show toast notification
        toast({
          title: "Task Due Now!",
          description: task.title,
          variant: "destructive",
        });
      }
    });
  };

  // Set up a timer to check tasks every minute
  useEffect(() => {
    // Check immediately when component mounts
    checkDueTasks();
    
    // Then check every minute
    const intervalId = setInterval(checkDueTasks, 5000); // Check every 5 seconds for testing
    
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
