
export type Task = {
  id: string;
  title: string;
  completed: boolean;
  recording?: string; // URL to the recording
  timestamp: number;
  dueDate?: Date; // Optional due date
  dueTime?: string; // Optional due time in HH:MM format
};

export type TimerSettings = {
  duration: number; // in seconds
  autoPlayRecording: boolean;
};
