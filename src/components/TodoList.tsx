import React from "react";
import { useTodo } from "../context/TodoContext";
import TodoItem from "./TodoItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TodoList() {
  const { tasks } = useTodo();
  
  // Sort tasks: incomplete tasks first, then by timestamp (newest first)
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return b.timestamp - a.timestamp;
  });

  return (
    <Card className="backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/30 dark:border-purple-900/30 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-white dark:text-white">
          <ListTodo className="mr-2 h-5 w-5" />
          Tasks {tasks.length > 0 && `(${tasks.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {sortedTasks.length > 0 ? (
            sortedTasks.map(task => (
              <TodoItem key={task.id} task={task} />
            ))
          ) : (
            <div className="text-center py-8 text-white/80 dark:text-muted-foreground">
              No tasks yet. Create one below!
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}