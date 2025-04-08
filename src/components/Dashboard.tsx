import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, CheckSquare, MessageCircle, FileQuestion } from 'lucide-react';
import TaskManager from './TaskManager';
import NoteEditor from './NoteEditor';
import PYQAnalyzer from './PYQAnalyzer';
import DoubtResolver from './DoubtResolver';
import pkg from '../../package.json';

const Dashboard = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-4xl font-bold mb-2 gradient-text">StudyScribe</h1>
          <span className="text-sm text-muted-foreground">v{pkg.version}</span>
        </div>
        <p className="text-muted-foreground">Your AI-powered study companion</p>
      </header>

      <div className="mb-8">
        <Tabs defaultValue="tasks" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              <TabsTrigger value="tasks" className="flex flex-col gap-1 py-2 h-auto">
                <CheckSquare className="h-5 w-5 text-study-green" />
                <span>Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex flex-col gap-1 py-2 h-auto">
                <BookOpen className="h-5 w-5 text-study-blue" />
                <span>Notes</span>
              </TabsTrigger>
              <TabsTrigger value="pyq" className="flex flex-col gap-1 py-2 h-auto">
                <FileQuestion className="h-5 w-5 text-study-teal" />
                <span>PYQ</span>
              </TabsTrigger>
              <TabsTrigger value="assistant" className="flex flex-col gap-1 py-2 h-auto">
                <MessageCircle className="h-5 w-5 text-study-purple" />
                <span>Assistant</span>
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
