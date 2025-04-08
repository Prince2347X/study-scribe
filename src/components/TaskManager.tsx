import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date | undefined;
};

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("study-tasks");
    if (savedTasks) {
      // Parse tasks and convert date strings back to Date objects
      const parsedTasks = JSON.parse(savedTasks);
      return parsedTasks.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined
      }));
    }
    return [];
  });
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    // Convert Date objects to ISO strings for storage
    const tasksToStore = tasks.map(task => ({
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString() : undefined
    }));
    localStorage.setItem("study-tasks", JSON.stringify(tasksToStore));
  }, [tasks]);

  const addTask = () => {
    if (newTaskTitle.trim() === "") {
      toast.error("Task title cannot be empty");
      return;
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      completed: false,
      dueDate: selectedDate,
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setSelectedDate(undefined);
    toast.success("Task added successfully");
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
    toast.info("Task removed");
  };

  // Group tasks by completion status
  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <Card className="w-full shadow-lg border-2 border-violet-200 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold gradient-text">Study Planner</CardTitle>
        <CardDescription>Keep track of your study tasks and deadlines</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add a study task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-grow"
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask();
            }}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-10 p-0">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={addTask} className="gradient-bg">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {pendingTasks.length > 0 ? (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-2">Pending Tasks</h3>
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-accent/50 card-hover"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskCompletion(task.id)}
                      />
                      <span className={cn(
                        "text-sm font-medium",
                        task.completed ? "line-through text-muted-foreground" : ""
                      )}>
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          Due: {format(new Date(task.dueDate), "MMM d")}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No pending tasks. Ready to add some?
            </div>
          )}

          {completedTasks.length > 0 && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-2">Completed Tasks</h3>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskCompletion(task.id)}
                      />
                      <span className="line-through text-sm text-muted-foreground">
                        {task.title}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="text-xs text-muted-foreground">
          {tasks.length} total task{tasks.length !== 1 ? "s" : ""} • {completedTasks.length} completed
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskManager;
