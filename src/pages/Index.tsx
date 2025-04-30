
import React from "react";
import { TodoProvider } from "../context/TodoContext";
import AddTodoForm from "../components/AddTodoForm";
import TodoList from "../components/TodoList";
import TimerComponent from "../components/TimerComponent";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  return (
    <TodoProvider>
      <div className="min-h-screen py-8 px-4 md:px-6 bg-gradient-to-br from-background to-purple-50/30 dark:from-background dark:to-purple-950/10">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Voice Timer Todo
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Manage tasks, record voice notes, and set due dates & times
            </p>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TodoList />
            </div>
            
            <div className="space-y-6">
              <TimerComponent />
              <AddTodoForm />
            </div>
          </div>
        </div>
      </div>
    </TodoProvider>
  );
};

export default Index;
