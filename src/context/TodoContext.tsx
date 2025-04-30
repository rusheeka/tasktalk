import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { Task, TimerSettings } from "../types";
import { toast } from "../hooks/use-toast";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface TodoContextProps {
  tasks: Task[];
  addTask: (
    title: string,
    recording?: string,
    dueDate?: Date,
    dueTime?: string
  ) => void;
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
  stopAlarm: () => void;
  activeAlarmTask: Task | null;
}

const TodoContext = createContext<TodoContextProps | undefined>(undefined);

export function TodoProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem("tasks");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    duration: 300,
    autoPlayRecording: true,
  });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<string | null>(null);
  const [activeAlarmTask, setActiveAlarmTask] = useState<Task | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notifiedTasksRef = useRef<Set<string>>(new Set());
  const alarmCheckIntervalRef = useRef<NodeJS.Timeout>();
  const remindAgainIntervalRef = useRef<NodeJS.Timeout>();

  const REMIND_EVERY_X_MINUTES = 3;

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    clearInterval(remindAgainIntervalRef.current as NodeJS.Timeout);
    setActiveAlarmTask(null);
    if (activeAlarmTask?.id) {
      notifiedTasksRef.current.delete(activeAlarmTask.id);
    }
  };

  const cleanup = () => {
    stopAlarm();
    if (alarmCheckIntervalRef.current) {
      clearInterval(alarmCheckIntervalRef.current);
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  const addTask = (
    title: string,
    recording?: string,
    dueDate?: Date,
    dueTime?: string
  ) => {
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
      description = `Task due on ${format(dueDate, "PPP")}${
        dueTime ? ` at ${dueTime}` : ""
      }`;
    } else if (dueTime) {
      description = `Task due at ${dueTime}`;
    }

    toast({
      title: "Task Added",
      description,
    });
  };

  const toggleTaskCompletion = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task && notifiedTasksRef.current.has(task.id)) {
      stopAlarm();
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task && notifiedTasksRef.current.has(task.id)) {
      stopAlarm();
    }

    setTasks((prev) => prev.filter((task) => task.id !== id));
    toast({
      title: "Task Deleted",
      description: "Your task has been removed.",
      variant: "destructive",
    });
  };

  const editTask = (id: string, title: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, title } : task))
    );
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

  const playReminderAudio = (task: Task) => {
    stopAlarm();

    const audio = new Audio(
      task.recording ||
        "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"
    );
    audio.loop = true;
    audio.play().catch((err) => console.error("Error playing audio:", err));
    audioRef.current = audio;
    setActiveAlarmTask(task);

    // Set repeating reminder
    remindAgainIntervalRef.current = setInterval(() => {
      const repeatAudio = new Audio(
        task.recording ||
          "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"
      );
      repeatAudio.play().catch((err) => console.error("Repeat audio error:", err));
    }, REMIND_EVERY_X_MINUTES * 60 * 1000);

    toast({
      title: "Task Due Now!",
      description: task.title,
      variant: "destructive",
      action: (
        <Button onClick={stopAlarm} variant="destructive" className="font-bold">
          MARK DONE
        </Button>
      ),
    });
  };

  const checkDueTasks = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    const currentDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    tasks.forEach((task) => {
      if (task.completed || notifiedTasksRef.current.has(task.id)) return;

      const isDueToday = task.dueDate
        ? new Date(task.dueDate).toDateString() === currentDate.toDateString()
        : true;

      const isTimeMatching = task.dueTime === currentTime;

      if (isDueToday && isTimeMatching) {
        notifiedTasksRef.current.add(task.id);
        playReminderAudio(task);
      }
    });
  };

  useEffect(() => {
    checkDueTasks();
    alarmCheckIntervalRef.current = setInterval(checkDueTasks, 60000);
    return cleanup;
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
        stopAlarm,
        activeAlarmTask,
      }}
    >
      {children}

      {activeAlarmTask && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl font-bold text-red-600 mb-4">⏰ ALARM ⏰</h1>
          <h2 className="text-3xl text-center mb-6">{activeAlarmTask.title}</h2>

          <div className="text-xl mb-8 text-center">
            {activeAlarmTask.dueDate && (
              <p>Due: {format(activeAlarmTask.dueDate, "PPPP")}</p>
            )}
            {activeAlarmTask.dueTime && <p>At: {activeAlarmTask.dueTime}</p>}
          </div>

          <Button
            onClick={stopAlarm}
            className="text-xl py-6 px-8 bg-red-600 hover:bg-red-700 text-white"
          >
            MARK DONE
          </Button>

          <div className="absolute bottom-0 left-0 w-full h-4 bg-red-600"></div>
        </div>
      )}
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
