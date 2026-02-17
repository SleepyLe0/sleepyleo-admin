"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Terminal, Bot, User, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

const funnyWaitingMessages = [
  "Consulting the ancient scrolls of Stack Overflow...",
  "Teaching hamsters to run faster in the server...",
  "Bribing the AI gods with virtual cookies...",
  "Asking ChatGPT if it's okay to help you...",
  "Untangling the spaghetti code in my brain...",
  "Converting coffee to code at maximum speed...",
  "Googling 'how to be a good intern'...",
  "Pretending to work really hard...",
  "Downloading more RAM... just kidding...",
  "Running around in circles (efficiently)...",
  "Convincing electrons to move faster...",
  "Negotiating with the cloud servers...",
  "Finding Nemo... wait, wrong task...",
  "Calculating the meaning of life (it's 42)...",
  "Warming up my neural networks...",
  "Asking my rubber duck for advice...",
  "Browsing memes for inspiration...",
  "Making sure I don't break anything...",
  "Spinning up the hamster wheel...",
  "Channeling my inner Stack Overflow...",
];

interface CommandResult {
  command: string;
  success: boolean;
  output?: string;
  error?: string;
}

interface Message {
  id: string;
  type: "user" | "assistant" | "command-result" | "error";
  content: string;
  commands?: CommandResult[];
  memes?: string;
  timestamp: Date;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "Hey there! I'm Leo's AI Intern, powered by Gemini. Tell me what you need in plain English and I'll figure out the commands to run. Try something like \"show me what's in this folder\" or \"what's my computer name\"!",
      timestamp: new Date(),
    },
  ]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cycle through funny waiting messages
  useEffect(() => {
    if (!isLoading) {
      setWaitingMessage("");
      return;
    }

    // Set initial message
    const randomIndex = Math.floor(Math.random() * funnyWaitingMessages.length);
    setWaitingMessage(funnyWaitingMessages[randomIndex]);

    // Cycle through messages every 2 seconds
    const interval = setInterval(() => {
      const newIndex = Math.floor(Math.random() * funnyWaitingMessages.length);
      setWaitingMessage(funnyWaitingMessages[newIndex]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const addMessage = (type: Message["type"], content: string, commands?: CommandResult[], memes?: string) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random(),
      type,
      content,
      commands,
      memes,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const sendMessage = async (userMessage: string) => {
    // Add user message to UI
    addMessage("user", userMessage);

    // Add to chat history for context
    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: "user", content: userMessage },
    ];
    setChatHistory(newHistory);

    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const result = await response.json();

      if (result.error) {
        addMessage("error", result.error);
        return;
      }

      // Add AI response
      addMessage("assistant", result.message || "Done!", result.commands, result.memes);

      // Build assistant response with command results for context
      let assistantContent = result.message || "";

      // Include command outputs in the history so AI can reference them
      if (result.commands && result.commands.length > 0) {
        const commandOutputs = result.commands.map((cmd: CommandResult) => {
          if (cmd.success) {
            return `[Command executed: ${cmd.command}]\nOutput:\n${cmd.output || "(no output)"}`;
          } else {
            return `[Command failed: ${cmd.command}]\nError: ${cmd.error}`;
          }
        }).join("\n\n");

        assistantContent = `${assistantContent}\n\n${commandOutputs}`;
      }

      // Update chat history with assistant response including command outputs
      setChatHistory([
        ...newHistory,
        { role: "assistant", content: assistantContent },
      ]);

    } catch (error) {
      addMessage("error", `Failed to communicate with AI: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");
    sendMessage(message);
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800 h-[600px] flex flex-col">
      <CardHeader className="border-b border-neutral-800 pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Bot className="h-5 w-5 text-indigo-400" />
          Leo's AI Intern
          <span className="text-xs text-neutral-500 font-normal ml-2">
            Powered by Gemini Flash 2.5
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div
                  className={cn(
                    "flex gap-3",
                    message.type === "user" && "justify-end"
                  )}
                >
                  {message.type !== "user" && (
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        message.type === "assistant" && "bg-indigo-500/20 text-indigo-400",
                        message.type === "command-result" && "bg-green-500/20 text-green-400",
                        message.type === "error" && "bg-red-500/20 text-red-400"
                      )}
                    >
                      {message.type === "assistant" && <Bot className="h-4 w-4" />}
                      {message.type === "command-result" && <Terminal className="h-4 w-4" />}
                      {message.type === "error" && <AlertCircle className="h-4 w-4" />}
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-4 py-2",
                      message.type === "user" && "bg-indigo-600 text-white",
                      message.type === "assistant" && "bg-neutral-800 text-neutral-200",
                      message.type === "error" && "bg-red-900/50 text-red-200"
                    )}
                  >
                    {message.memes && (
                      <Image
                        src={message.memes}
                        alt="reaction"
                        width={200}
                        height={144}
                        sizes="200px"
                        className="h-36 w-auto rounded-lg mb-3"
                        unoptimized
                      />
                    )}
                    {message.type === "assistant" ? (
                      <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-2 prose-code:bg-neutral-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-indigo-300 prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-700">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>

                  {message.type === "user" && (
                    <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-neutral-300" />
                    </div>
                  )}
                </div>

                {/* Command Results */}
                {message.commands && message.commands.length > 0 && (
                  <div className="ml-11 space-y-2">
                    {message.commands.map((cmd, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "rounded-lg border overflow-hidden",
                          cmd.success ? "border-green-500/30 bg-green-950/20" : "border-red-500/30 bg-red-950/20"
                        )}
                      >
                        <div className={cn(
                          "px-3 py-1.5 text-xs font-mono flex items-center gap-2",
                          cmd.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                        )}>
                          {cmd.success ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          <span className="opacity-60">$</span> {cmd.command}
                        </div>
                        {(cmd.output || cmd.error) && (
                          <pre className="px-3 py-2 text-xs font-mono text-neutral-300 whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto">
                            {cmd.output || cmd.error}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
                </div>
                <div className="bg-neutral-800 rounded-lg px-4 py-3 text-neutral-300 max-w-[85%]">
                  <span className="inline-block transition-opacity duration-300">
                    {waitingMessage || "Thinking..."}
                  </span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-neutral-800 flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me what you need in plain English..."
            disabled={isLoading}
            className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
