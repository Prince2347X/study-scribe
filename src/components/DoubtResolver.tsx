import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import {
  resolveDoubt,
  GeminiMessage,
  generateSummary,
} from "../services/gemini";
import {
  SendHorizontal,
  Bot,
  User,
  Calendar as CalendarIcon,
  BookmarkPlus,
  PenSquare,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Task type from TaskManager
type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date | undefined;
};

// Note type from NoteEditor
type Note = {
  id: string;
  title: string;
  content: string;
  subject: string;
  summary?: string;
  createdAt: Date;
};

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "History",
  "Geography",
  "Literature",
  "Economics",
  "Other",
];

const DoubtResolver = () => {
  // Existing states
  const [messages, setMessages] = useState<
    { role: "user" | "model"; content: string }[]
  >([
    {
      role: "model",
      content:
        "Hi! I'm your AI study assistant. How can I help you with your studies today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("General");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New states for context menu and dialogs
  const [selectedText, setSelectedText] = useState("");
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState<Date>();
  const [noteTitle, setNoteTitle] = useState("");
  const [noteSubject, setNoteSubject] = useState(SUBJECTS[0]);
  const [noteSummary, setNoteSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Load existing tasks and notes from localStorage
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("study-tasks");
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      return parsedTasks.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      }));
    }
    return [];
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem("study-notes");
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes);
      return parsedNotes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
      }));
    }
    return [];
  });

  // Save tasks and notes to localStorage when they change
  useEffect(() => {
    const tasksToStore = tasks.map((task) => ({
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
    }));
    localStorage.setItem("study-tasks", JSON.stringify(tasksToStore));
  }, [tasks]);

  useEffect(() => {
    const notesToStore = notes.map((note) => ({
      ...note,
      createdAt: note.createdAt.toISOString(),
    }));
    localStorage.setItem("study-notes", JSON.stringify(notesToStore));
  }, [notes]);

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        setSelectedText(selection.toString().trim());
      } else {
        setSelectedText("");
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const contextMenu = document.querySelector(".context-menu");
      if (contextMenu && !contextMenu.contains(event.target as Node)) {
        setSelectedText("");
      }
    };

    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Existing scroll effect
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Save as task
  const saveAsTask = () => {
    if (!taskTitle.trim()) {
      toast.error("Task title cannot be empty");
      return;
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: taskTitle,
      completed: false,
      dueDate: taskDate,
    };

    setTasks([...tasks, newTask]);
    setTaskTitle("");
    setTaskDate(undefined);
    setShowTaskDialog(false);
    toast.success("Task added successfully");
  };

  // Generate summary and save as note
  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const result = await generateSummary(selectedText);
      if (result) {
        setNoteSummary(result);
      }
    } catch (error) {
      toast.error("Failed to generate summary");
      console.error(error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Save as note
  const saveAsNote = () => {
    if (!noteTitle.trim()) {
      toast.error("Note title cannot be empty");
      return;
    }

    const newNote: Note = {
      id: crypto.randomUUID(),
      title: noteTitle,
      content: selectedText,
      subject: noteSubject,
      summary: noteSummary,
      createdAt: new Date(),
    };

    setNotes([...notes, newNote]);
    setNoteTitle("");
    setNoteSubject(SUBJECTS[0]);
    setNoteSummary("");
    setShowNoteDialog(false);
    toast.success("Note saved successfully");
  };

  // Existing sendMessage function
  const sendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = input.trim();
    setInput("");

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    // Show typing indicator
    setIsLoading(true);

    try {
      // Convert to format expected by Gemini API
      const geminiMessages: GeminiMessage[] = [
        ...messages.map((msg) => ({ role: msg.role, parts: msg.content })),
        { role: "user", parts: userMessage },
      ];

      // Get response from Gemini
      const response = await resolveDoubt(userMessage, subject);

      if (response) {
        // Add bot response to chat
        setMessages((prev) => [...prev, { role: "model", content: response }]);
      }
    } catch (error) {
      console.error("Error getting response:", error);
      toast.error("Failed to get a response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save as Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Task title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {taskDate ? format(taskDate, "PPP") : "Pick a due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={taskDate}
                    onSelect={setTaskDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="bg-muted rounded-md p-3">
              <div className="text-sm font-medium mb-2">Selected Text</div>
              <div className="text-sm text-muted-foreground">
                {selectedText}
              </div>
            </div>
            <Button onClick={saveAsTask}>Save Task</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Save as Note</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Note title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
              <Select value={noteSubject} onValueChange={setNoteSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">Content</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                >
                  Generate Summary
                </Button>
              </div>
              <div className="bg-muted rounded-md p-3">
                <div className="text-sm text-muted-foreground">
                  {selectedText}
                </div>
              </div>
              {isGeneratingSummary ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                noteSummary && (
                  <div className="bg-muted rounded-md p-3">
                    <div className="text-sm font-medium mb-2">AI Summary</div>
                    <div className="text-sm text-muted-foreground">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {noteSummary}
                      </ReactMarkdown>
                    </div>
                  </div>
                )
              )}
            </div>
            <Button onClick={saveAsNote}>Save Note</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Context Menu */}
      {selectedText && (
        <div
          className="fixed bg-white/95 backdrop-blur-lg rounded-lg shadow-lg border-2 border-purple-200 p-3 space-y-2 z-50 context-menu"
          style={{
            top:
              (window.getSelection()?.getRangeAt(0).getBoundingClientRect()
                .bottom || 0) + 10,
            left:
              window.getSelection()?.getRangeAt(0).getBoundingClientRect()
                .left || 0,
          }}
        >
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start font-medium hover:bg-purple-100"
            onClick={() => {
              setTaskTitle(selectedText.split("\n")[0]);
              setShowTaskDialog(true);
            }}
          >
            <BookmarkPlus className="h-4 w-4 mr-2 text-study-purple" />
            Save as Task
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start font-medium hover:bg-blue-100"
            onClick={() => {
              setNoteTitle(selectedText.split("\n")[0]);
              setShowNoteDialog(true);
            }}
          >
            <PenSquare className="h-4 w-4 mr-2 text-study-blue" />
            Save as Note
          </Button>
        </div>
      )}

      <Card className="w-full shadow-lg border-2 border-purple-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold gradient-text">
            Study Assistant
          </CardTitle>
          <CardDescription>
            Ask questions and resolve your study doubts with AI
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col h-[500px]">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex gap-3 max-w-[80%] ${
                        msg.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar
                        className={`h-8 w-8 ${msg.role === "user" ? "bg-study-purple" : "bg-study-blue"}`}
                      >
                        <AvatarFallback>
                          {msg.role === "user" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-lg p-3 ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-study-purple to-study-blue text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-[80%]">
                      <Avatar className="h-8 w-8 bg-study-blue">
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg p-3 bg-gray-100 space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask your study question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isLoading}
                  className="flex-grow"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || input.trim() === ""}
                  className="gradient-bg"
                >
                  <SendHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default DoubtResolver;
