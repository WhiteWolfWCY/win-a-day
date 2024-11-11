"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Loader2, Sparkles, Bot, Brain, MessageSquare, Plus, ThumbsUp, Zap } from "lucide-react";
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';
import { Button } from './ui/button';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from './ui/scroll-area';
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations();

  return (
    <>
      <div className="fixed right-6 bottom-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Sparkles className="h-6 w-6 text-primary" />
        </motion.button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-8">
          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="insights">
                <Brain className="h-4 w-4 mr-2" />
                {t('ai.tabs.insights')}
              </TabsTrigger>
              <TabsTrigger value="suggestions">
                <Zap className="h-4 w-4 mr-2" />
                {t('ai.tabs.suggestions')}
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                {t('ai.tabs.chat')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="insights" className="mt-4">
              <AIInsightsContent />
            </TabsContent>
            
            <TabsContent value="suggestions" className="mt-4">
              <AISuggestionsContent />
            </TabsContent>

            <TabsContent value="chat" className="mt-4">
              <AIChatContent />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Separate component for AI Insights content
function AIInsightsContent() {
  const { userId } = useAuth();
  const t = useTranslations();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAIAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error getting AI analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info section */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-lg">
          {t('ai.insights.title')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('ai.insights.description')}
        </p>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
          <li>{t('ai.insights.features.habits')}</li>
          <li>{t('ai.insights.features.goals')}</li>
          <li>{t('ai.insights.features.recommendations')}</li>
        </ul>
      </div>

      {!analysis ? (
        <Button 
          onClick={getAIAnalysis} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('common.loading')}
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              {t('dashboard.getAIAnalysis')}
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          <ScrollArea className="h-[60vh] pr-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </ScrollArea>
          <Button 
            variant="outline" 
            onClick={() => setAnalysis(null)}
            className="w-full mt-4"
          >
            {t('dashboard.newAnalysis')}
          </Button>
        </div>
      )}
    </div>
  );
}

function AISuggestionsContent() {
  const { userId } = useAuth();
  const t = useTranslations();
  const [suggestions, setSuggestions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info section */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-lg">
          {t('ai.suggestions.title')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('ai.suggestions.description')}
        </p>
      </div>

      {!suggestions ? (
        <Button 
          onClick={getSuggestions} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('common.loading')}
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              {t('ai.suggestions.generate')}
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          <ScrollArea className="h-[40vh] pr-4">
            <div className="grid grid-cols-1 gap-4">
              {suggestions.habits && (
                <Card className="p-4 space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    {t('ai.suggestions.recommendedHabits')}
                  </h4>
                  <div className="space-y-2">
                    {suggestions.habits.map((habit: any, index: number) => (
                      <div key={index} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50">
                        <span className="text-sm">{habit.name}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              
              {suggestions.goals && (
                <Card className="p-4 space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    {t('ai.suggestions.recommendedGoals')}
                  </h4>
                  <div className="space-y-2">
                    {suggestions.goals.map((goal: any, index: number) => (
                      <div key={index} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50">
                        <span className="text-sm">{goal.name}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </ScrollArea>
          <Button 
            variant="outline" 
            onClick={() => setSuggestions(null)}
            className="w-full mt-4"
          >
            {t('ai.suggestions.newSuggestions')}
          </Button>
        </div>
      )}
    </div>
  );
}

function AIChatContent() {
  const { userId } = useAuth();
  const t = useTranslations();
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId,
          message: input,
          history: messages
        }),
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error in chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Bot className="h-5 w-5" />
          {t('ai.chat.title')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('ai.chat.description')}
        </p>
      </div>

      <ScrollArea className="h-[50vh] pr-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "p-4 rounded-lg max-w-[80%]",
                message.role === 'user' 
                  ? "bg-primary text-white ml-auto" 
                  : "bg-primary/60 text-black"
              )}
            >
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            </div>
          ))}
          {isLoading && (
            <div className="bg-muted p-4 rounded-lg max-w-[80%] flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('common.thinking')}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex items-center gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('ai.chat.placeholder')}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <Button 
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 