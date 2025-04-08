import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveDoubt, GeminiMessage } from '../services/gemini';
import { SendHorizontal, Bot, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const DoubtResolver = () => {
  const [messages, setMessages] = useState<{ role: "user" | "model"; content: string }[]>([
    { role: "model", content: "Hi! I'm your AI study assistant. How can I help you with your studies today?" }
  ]);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("General");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (input.trim() === "") return;
    
    const userMessage = input.trim();
    setInput("");
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    
    // Show typing indicator
    setIsLoading(true);
    
    try {
      // Convert to format expected by Gemini API
      const geminiMessages: GeminiMessage[] = [
        ...messages.map(msg => ({ role: msg.role, parts: msg.content })),
        { role: "user", parts: userMessage }
      ];
      
      // Get response from Gemini
      const response = await resolveDoubt(userMessage, subject);
      
      if (response) {
        // Add bot response to chat
        setMessages(prev => [...prev, { role: "model", content: response }]);
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
    <Card className="w-full shadow-lg border-2 border-purple-200 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold gradient-text">Study Assistant</CardTitle>
        <CardDescription>Ask questions and resolve your study doubts with AI</CardDescription>
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
                    <Avatar className={`h-8 w-8 ${msg.role === "user" ? "bg-study-purple" : "bg-study-blue"}`}>
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
  );
};

export default DoubtResolver;
