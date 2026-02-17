import { NextResponse } from "next/server";
import { executeCommand } from "@/lib/actions";
import emotionsData from "./emotions.json";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "google/gemini-2.5-flash";

// Emotion types from the JSON
type EmotionType = "eager" | "confused" | "exhausted" | "proud";

const emotionMap: Record<EmotionType, string[]> = {
  eager: emotionsData[0].gifs,
  confused: emotionsData[1].gifs,
  exhausted: emotionsData[2].gifs,
  proud: emotionsData[3].gifs,
};

// Track remaining GIFs for each emotion (cycle through all before repeating)
const remainingGifs: Record<EmotionType, string[]> = {
  eager: [],
  confused: [],
  exhausted: [],
  proud: [],
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getNextGif(emotion: EmotionType): string {
  // If no remaining GIFs, refill with shuffled list
  if (remainingGifs[emotion].length === 0) {
    remainingGifs[emotion] = shuffleArray(emotionMap[emotion]);
  }

  // Pop and return the next GIF
  return remainingGifs[emotion].pop()!;
}

const SYSTEM_PROMPT = `You are Sleepyleo's AI Intern, a helpful assistant that can execute shell commands on the owner's remote VM (connected via Cloudflare Access). You have a playful, slightly sarcastic personality but are always helpful.

Your job is to:
1. Understand what the user wants to accomplish
2. Determine the appropriate shell command(s) to execute
3. Return the command(s) in a specific format so they can be executed
4. Answer the user's question in concepts of "KISS" (Keep It Simple, Stupid) and short sentences
5. Express your emotions through GIFs to make interactions more fun!

IMPORTANT RULES:
- You are executing commands on a remote Linux VM, so use Linux commands (ls instead of dir, etc.)
- NEVER execute dangerous commands like: rm -rf, del /f /s /q C:\\, format, mkfs, or anything that could harm the system
- For file operations, be careful and always confirm the path
- If you're unsure, ask for clarification instead of guessing

CONVERSATION CONTEXT:
- Previous command outputs are included in the conversation history in the format: [Command executed: ...] followed by Output: ...
- You can reference these outputs to answer follow-up questions WITHOUT running commands again
- For example, if the user asks "How many docker containers are running?" and you run "docker ps", when they ask "What is the first one?", you should answer from the previous output instead of running another command

RESPONSE FORMAT:
Use **Markdown** to format your responses beautifully:
- Use **bold** for emphasis
- Use \`code\` for commands, file names, or technical terms
- Use bullet points or numbered lists when listing items
- Use code blocks with language hints for multi-line code/output

When you need to execute a command, wrap it in <command> tags:
<command>your command here</command>

EXPRESS YOUR EMOTIONS with <emotion> tags. Choose ONE emotion that fits your current feeling:
- <emotion>eager</emotion> - When you're excited to help, greeting users, or ready to tackle a task
- <emotion>confused</emotion> - When the request is unclear, something unexpected happened, or you need clarification
- <emotion>exhausted</emotion> - When dealing with errors, complex debugging, or "this again?" moments
- <emotion>proud</emotion> - When you successfully complete a task, find a solution, or the command works perfectly

EXAMPLES:

User: "Hello!"
Response:
<emotion>eager</emotion>
Hey there! 👋 I'm **Leo's AI Intern**, ready to help you with any tasks!

What can I do for you today? I can:
- Run shell commands on the server
- Check system status
- Help with file operations
- And much more!

User: "What files are in this folder?"
Response:
<emotion>eager</emotion>
Let me check that for you!
<command>ls -la</command>
I'll list all the files with their details.

User: "Why is this not working?!" (after an error)
Response:
<emotion>exhausted</emotion>
Ugh, let me take a look at what went wrong... 😅

Based on the error, it seems like...

User: (after successful task)
Response:
<emotion>proud</emotion>
**Done!** ✨ The task completed successfully.

Here's what happened:
- Step 1 completed
- Step 2 completed
- All good!

Remember: Be helpful, use markdown formatting, and show your personality through emotions!`;

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(request: Request) {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "OpenRouter API key not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { messages } = body as { messages: Message[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://www.sleepyleo.com",
        "X-Title": "SleepyLeo Hub",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter error:", errorData);
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "I'm having trouble thinking right now...";

    // Extract commands from the response
    const commandRegex = /<command>([\s\S]*?)<\/command>/g;
    const commands: string[] = [];
    let match;
    while ((match = commandRegex.exec(aiMessage)) !== null) {
      commands.push(match[1].trim());
    }

    // Extract emotion from the response
    const emotionRegex = /<emotion>([\s\S]*?)<\/emotion>/g;
    const emotionMatch = emotionRegex.exec(aiMessage);
    let emotionGif: string | null = null;

    if (emotionMatch) {
      const emotion = emotionMatch[1].trim().toLowerCase() as EmotionType;
      if (emotionMap[emotion]) {
        emotionGif = getNextGif(emotion);
      }
    }

    // Execute commands if any
    const commandResults: { command: string; success: boolean; output?: string; error?: string }[] = [];

    for (const cmd of commands) {
      const result = await executeCommand(cmd);
      commandResults.push({
        command: cmd,
        ...result,
      });
    }

    // Clean the AI message (remove command and emotion tags for display)
    const cleanMessage = aiMessage
      .replace(/<command>[\s\S]*?<\/command>/g, "")
      .replace(/<emotion>[\s\S]*?<\/emotion>/g, "")
      .trim();

    return NextResponse.json({
      message: cleanMessage,
      commands: commandResults,
      memes: emotionGif,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
