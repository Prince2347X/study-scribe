import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  CheckSquare,
  MessageCircle,
  FileQuestion,
} from "lucide-react";
import TaskManager from "./TaskManager";
import NoteEditor from "./NoteEditor";
import PYQAnalyzer from "./PYQAnalyzer";
import DoubtResolver from "./DoubtResolver";
import pkg from "../../package.json";

const Dashboard = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-study-blue to-study-purple bg-clip-text text-transparent">
            StudyScribe
          </h1>
          <span className="text-sm text-muted-foreground">v{pkg.version}</span>
        </div>
        <p className="text-muted-foreground">Your AI-powered study companion</p>
      </header>

      <div className="mb-8">
        <Tabs defaultValue="tasks" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-xl p-2 h-[96px]">
              <TabsTrigger
                value="tasks"
                className="flex flex-col items-center gap-2 py-3 px-4 h-[88px] rounded-lg transition-all duration-200 hover:text-study-green hover:opacity-100
                data-[state=inactive]:opacity-70 
                data-[state=active]:bg-study-green/5 
                data-[state=active]:border-2 
                data-[state=active]:border-study-green/50 
                data-[state=active]:text-study-green"
              >
                <CheckSquare className="h-5 w-5 text-study-green" />
                <span className="font-medium">Tasks</span>
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="flex flex-col items-center gap-2 py-3 px-4 h-[88px] rounded-lg transition-all duration-200 hover:text-study-blue hover:opacity-100
                data-[state=inactive]:opacity-70 
                data-[state=active]:bg-study-blue/5 
                data-[state=active]:border-2 
                data-[state=active]:border-study-blue/50 
                data-[state=active]:text-study-blue"
              >
                <BookOpen className="h-5 w-5 text-study-blue" />
                <span className="font-medium">Notes</span>
              </TabsTrigger>
              <TabsTrigger
                value="pyq"
                className="flex flex-col items-center gap-2 py-3 px-4 h-[88px] rounded-lg transition-all duration-200 hover:text-study-teal hover:opacity-100
                data-[state=inactive]:opacity-70 
                data-[state=active]:bg-study-teal/5 
                data-[state=active]:border-2 
                data-[state=active]:border-study-teal/50 
                data-[state=active]:text-study-teal"
              >
                <FileQuestion className="h-5 w-5 text-study-teal" />
                <span className="font-medium">PYQ</span>
              </TabsTrigger>
              <TabsTrigger
                value="assistant"
                className="flex flex-col items-center gap-2 py-3 px-4 h-[88px] rounded-lg transition-all duration-200 hover:text-study-purple hover:opacity-100
                data-[state=inactive]:opacity-70 
                data-[state=active]:bg-study-purple/5 
                data-[state=active]:border-2 
                data-[state=active]:border-study-purple/50 
                data-[state=active]:text-study-purple"
              >
                <MessageCircle className="h-5 w-5 text-study-purple" />
                <span className="font-medium">Assistant</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="tasks" className="mt-0">
            <TaskManager />
          </TabsContent>

          <TabsContent value="notes" className="mt-0">
            <NoteEditor />
          </TabsContent>

          <TabsContent value="pyq" className="mt-0">
            <PYQAnalyzer />
          </TabsContent>

          <TabsContent value="assistant" className="mt-0">
            <DoubtResolver />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
