"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Terminal, Bot, User, Loader2, AlertCircle, CheckCircle2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const funnyWaitingMessages = [
  "Consulting the ancient scrolls of Stack Overflow...",
  "Teaching hamsters to run faster in the server...",
  "Bribing the AI gods with virtual cookies...",
  "Asking ChatGPT if it's okay to help you...",
  "Untangling the spaghetti code in my brain...",
  "Converting matcha to code at maximum speed...",
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

// ── Code block with copy button ──────────────────────────────────────────────
function CodeBlock({ children, className }: { children?: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);
  const code = typeof children === "string" ? children : "";
  const lang = className?.replace("language-", "") ?? "shell";

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-white/10 bg-neutral-950">
      {/* header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="text-[10px] font-mono text-neutral-500 ml-1 uppercase tracking-widest">{lang}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-white transition-colors px-2 py-0.5 rounded hover:bg-white/5"
        >
          {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] font-mono leading-relaxed text-emerald-300">
        <code>{children}</code>
      </pre>
    </div>
  );
}

// ── Custom markdown component map ────────────────────────────────────────────
const markdownComponents: Components = {
  // Headings
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-white mt-5 mb-3 pb-2 border-b border-white/10 flex items-center gap-2">
      <span className="w-1 h-5 rounded-full bg-indigo-500 inline-block flex-shrink-0" />
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-semibold text-indigo-300 mt-4 mb-2 flex items-center gap-2">
      <span className="w-0.5 h-4 rounded-full bg-indigo-400 inline-block flex-shrink-0" />
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-neutral-200 mt-3 mb-1.5 uppercase tracking-wide">
      {children}
    </h3>
  ),
  // Paragraph
  p: ({ children }) => (
    <p className="text-sm text-neutral-200 leading-relaxed my-2">{children}</p>
  ),
  // Lists
  ul: ({ children }) => (
    <ul className="my-2 space-y-1.5 pl-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 space-y-1.5 pl-5 list-decimal marker:text-indigo-400">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="flex items-start gap-2 text-sm text-neutral-200 leading-relaxed">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  // Inline code
  code: ({ children, className }) => {
    const isBlock = className?.startsWith("language-");
    if (isBlock) return <code className={className}>{children}</code>;
    return (
      <code className="px-1.5 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300 font-mono text-[12px] border border-indigo-500/20">
        {children}
      </code>
    );
  },
  // Code block — delegated to CodeBlock
  pre: ({ children }) => {
    const child = children as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
    return (
      <CodeBlock className={child?.props?.className}>
        {child?.props?.children}
      </CodeBlock>
    );
  },
  // Blockquote — used for 💡 tip lines
  blockquote: ({ children }) => (
    <blockquote className="my-3 pl-4 pr-3 py-2.5 rounded-r-xl border-l-2 border-indigo-500 bg-indigo-950/30 text-sm text-indigo-200 italic">
      {children}
    </blockquote>
  ),
  // Horizontal rule
  hr: () => (
    <hr className="my-4 border-none h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  ),
  // Bold & italic
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-neutral-300">{children}</em>
  ),
  // Tables
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-neutral-800 text-neutral-300 font-medium">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-white/5">{children}</tbody>
  ),
  tr: ({ children }) => <tr className="hover:bg-white/5 transition-colors">{children}</tr>,
  th: ({ children }) => <th className="px-4 py-2 text-left text-xs uppercase tracking-wider">{children}</th>,
  td: ({ children }) => <td className="px-4 py-2.5 text-neutral-300">{children}</td>,
  // Links
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300 transition-colors"
    >
      {children}
    </a>
  ),
};

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
          Leo&apos;s AI Intern
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
                      <div className="min-w-0">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {message.content}
                        </ReactMarkdown>
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
