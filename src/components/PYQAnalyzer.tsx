
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { analyzePYQs } from '../services/gemini';
import { Skeleton } from '@/components/ui/skeleton';

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
  "Other"
];

const PYQAnalyzer = () => {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [questions, setQuestions] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (questions.trim().length < 20) {
      toast.error("Please add more questions to analyze");
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysis("");
    
    try {
      const result = await analyzePYQs(questions, subject);
      if (result) {
        setAnalysis(result);
        toast.success("Analysis completed successfully");
      }
    } catch (error) {
      toast.error("Failed to analyze questions");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-2 border-teal-200 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-study-blue to-study-teal text-transparent bg-clip-text">
            PYQ Analyzer
          </span>
        </CardTitle>
        <CardDescription>Analyze previous year questions with AI assistance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map(sub => (
                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Paste your previous year questions here..."
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              className="min-h-[150px]"
            />
            <Button 
              onClick={handleAnalyze} 
              className="gradient-bg-teal w-full"
              disabled={isAnalyzing || questions.trim().length < 20}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze Questions
            </Button>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">Analysis Results</h3>
            <ScrollArea className="h-[200px]">
              {isAnalyzing ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : analysis ? (
                <div className="prose prose-sm max-w-none">
                  {analysis.split('\n').map((paragraph, i) => (
                    paragraph ? <p key={i}>{paragraph}</p> : <br key={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No analysis yet. Paste some questions and click "Analyze"</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PYQAnalyzer;
