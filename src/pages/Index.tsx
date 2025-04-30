import React from "react";
import { TodoProvider } from "../context/TodoContext";
import AddTodoForm from "../components/AddTodoForm";
import TodoList from "../components/TodoList";
import TimerComponent from "../components/TimerComponent";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  return (
    <TodoProvider>
      <div className="relative min-h-screen py-8 px-4 md:px-6 overflow-hidden">
        {/* Background Video */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/background.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Overlay to darken the video and improve content readability */}
          <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Transparent gradient box for header - now with top-to-bottom gradient */}
          <div className="mb-8 text-center p-6 rounded-lg backdrop-blur-sm bg-gradient-to-b from-black/80 to-black/40 border border-white/20 dark:border-purple-900/30 shadow-lg">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-100 bg-clip-text text-transparent">
              Task Talk
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Manage tasks, record voice notes, and set due dates & times
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TodoList />
            </div>
            
            <div className="space-y-6">
              <AddTodoForm />
              <TimerComponent />
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </TodoProvider>
  );
};

export default Index;