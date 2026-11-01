"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Send,
  Sparkles,
  Bot,
  User,
  RefreshCw,
  Download,
  Lightbulb,
  Calendar,
  DollarSign,
  Users,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { aiApi, AIChatResponse } from "@/lib/api";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  extractedData?: Record<string, unknown>;
}

const inputSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

type InputForm = z.infer<typeof inputSchema>;

const STARTER_PROMPTS = [
  {
    icon: "💍",
    label: "Plan a Wedding",
    prompt:
      "I want to plan a traditional Indian wedding in Hyderabad for 300 guests. My budget is ₹15 lakh and the date is February 2027. I need vegetarian food, photography, decoration, and an outdoor venue.",
  },
  {
    icon: "💼",
    label: "Corporate Event",
    prompt:
      "Help me plan an annual company day event for 200 employees in Bengaluru. Budget is ₹8 lakh. I need a hotel venue, catering, team activities, and a gala dinner.",
  },
  {
    icon: "🎂",
    label: "Birthday Party",
    prompt:
      "I want to throw a surprise birthday party for 50 friends in Mumbai. Budget ₹1 lakh, date is next month. Outdoor theme with DJ and food.",
  },
  {
    icon: "🎓",
    label: "College Festival",
    prompt:
      "Help me organize our college's annual techfest in Chennai for 1500 students. Budget ₹5 lakh. 3-day event with competitions, celebrity night, and food stalls.",
  },
];

const SYSTEM_GREETING: Message = {
  id: "system-0",
  role: "assistant",
  content: `Hi! I'm your EventVerse AI planner. 🎉

I can help you plan any type of event — weddings, corporate events, birthdays, college fests, and more.

**Here's what I can do for you:**
- Create a complete event plan from your description
- Generate an itemized budget breakdown
- Suggest themes, vendors, and timelines
- Identify risks and propose contingency plans
- Update any part of your plan when requirements change

**Tell me about your event** — what type of event, when, where, how many guests, and your budget. Or choose one of the quick-start options below.`,
  timestamp: new Date(),
  suggestions: [
    "Plan a wedding for 300 guests with ₹15 lakh budget",
    "Create a corporate event plan for 200 employees",
    "How do I reduce my event budget by ₹2 lakh?",
  ],
};

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 mb-4", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isUser
            ? "bg-violet-600 text-white"
            : "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className={cn("flex flex-col max-w-[80%]", isUser && "items-end")}>
        <div
          className={cn(
            "px-4 py-3 text-sm leading-relaxed",
            isUser ? "chat-bubble-user" : "chat-bubble-ai"
          )}
          dangerouslySetInnerHTML={{
            __html: message.content
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/\n/g, "<br />")
              .replace(/- (.*)/g, "• $1"),
          }}
        />

        {/* Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                className="text-xs px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-100 transition-colors"
                onClick={() => {
                  // This gets handled by parent
                  const event = new CustomEvent("suggestionClick", { detail: suggestion });
                  window.dispatchEvent(event);
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-400 mt-1 px-1">
          {message.timestamp.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="chat-bubble-ai px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

export default function AIPlanner() {
  const [messages, setMessages] = useState<Message[]>([SYSTEM_GREETING]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<InputForm>({
    resolver: zodResolver(inputSchema),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle suggestion clicks from child components
  useEffect(() => {
    const handler = (e: Event) => {
      const suggestion = (e as CustomEvent).detail as string;
      setValue("message", suggestion);
    };
    window.addEventListener("suggestionClick", handler);
    return () => window.removeEventListener("suggestionClick", handler);
  }, [setValue]);

  const sendMessage = async (data: InputForm) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: data.message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    reset();
    setIsTyping(true);

    try {
      const response = await aiApi.chat({
        conversation_id: conversationId,
        message: data.message,
      }) as AIChatResponse;

      setConversationId(response.conversation_id);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions,
        extractedData: response.extracted_data as Record<string, unknown> | undefined,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      // Graceful fallback when AI service is unavailable
      const fallback: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: `I received your message about: **"${data.message}"**

I'm currently unable to connect to the AI service. Please check that the backend is running and your AI API keys are configured in the environment.

In the meantime, you can:
- Use the **Event Wizard** to create a structured event plan
- Browse our **Vendor Marketplace** for local vendors
- Set up your **Budget** manually in the Budget section`,
        timestamp: new Date(),
        suggestions: [
          "Go to Event Creation Wizard",
          "Browse Vendor Marketplace",
          "Setup Budget Manually",
        ],
      };
      setMessages((prev) => [...prev, fallback]);
      toast.error("AI service unavailable — check backend configuration");
    } finally {
      setIsTyping(false);
    }
  };

  const handleStarterPrompt = (prompt: string) => {
    setValue("message", prompt);
    handleSubmit(sendMessage)();
  };

  const handleClearConversation = () => {
    setMessages([SYSTEM_GREETING]);
    setConversationId(undefined);
  };

  return (
    <div className="h-full flex gap-6 max-h-[calc(100vh-8rem)]">
      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-violet-600" />
              AI Event Planner
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Describe your event and let AI create a complete plan
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearConversation}
            className="text-slate-500"
          >
            <RefreshCw className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Messages */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 dark:border-slate-800 p-4">
            <form onSubmit={handleSubmit(sendMessage)} className="flex gap-3">
              <input
                {...register("message")}
                placeholder="Describe your event or ask anything about event planning..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-violet-500 transition-shadow"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(sendMessage)();
                  }
                }}
                aria-label="Chat message input"
              />
              <Button
                type="submit"
                variant="gradient"
                size="icon"
                disabled={isSubmitting || isTyping}
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-xs text-slate-400 mt-2 text-center">
              AI responses are suggestions. Always verify vendor details independently.
            </p>
          </div>
        </Card>
      </div>

      {/* Sidebar: Quick starters + context */}
      <div className="w-72 shrink-0 space-y-4 overflow-y-auto">
        {/* Quick starters */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Quick Start
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {STARTER_PROMPTS.map((starter) => (
              <button
                key={starter.label}
                onClick={() => handleStarterPrompt(starter.prompt)}
                className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <span className="text-xl">{starter.icon}</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-violet-600 dark:group-hover:text-violet-400">
                  {starter.label}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Capabilities */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">What AI Can Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { icon: DollarSign, label: "Budget Breakdown" },
              { icon: Calendar, label: "Preparation Timeline" },
              { icon: Users, label: "Guest Management Plan" },
              { icon: MapPin, label: "Venue Recommendations" },
              { icon: Download, label: "Exportable Documents" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Icon className="w-3.5 h-3.5 text-violet-500" />
                {label}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Notice */}
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-700 dark:text-amber-400">
          <p className="font-semibold mb-1">Important</p>
          <p>
            AI-generated budgets are estimates. Vendor quotes are not confirmed until vendors
            respond. Always verify before committing.
          </p>
        </div>
      </div>
    </div>
  );
}
