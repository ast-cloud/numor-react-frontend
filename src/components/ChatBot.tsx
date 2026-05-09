import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import { BotMascot } from "@/components/BotMascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { config } from "@/lib/config";
import { getToken } from "@/lib/api/authToken";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchHistory = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${config.backendHost}/api/chatbot/chat/history`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.history)) {
          setMessages(
            data.history.map((m: { id: string; role: "user" | "assistant"; content: string }) => ({
              id: m.id,
              content: m.content,
              role: m.role,
            }))
          );
        }
      } catch {
        // silently fail
      }
    };
    fetchHistory();
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (messages.length === 0) {
          setIsOpen(false);
        } else {
          setShowConfirm(true);
        }
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleClose = async () => {
    try {
      const token = getToken();
      await fetch(`${config.backendHost}/api/chatbot/chat/deleteHistory`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      // silently fail
    }
    setMessages([]);
    setShowConfirm(false);
    setIsOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();

    try {
      const token = getToken();
      const res = await fetch(`${config.backendHost}/api/chatbot/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!res.body) throw new Error("No response body");

      // Add empty assistant message for live streaming
      setMessages((prev) => [...prev, { id: assistantId, content: "", role: "assistant" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() || "";

        let shouldStop = false;
        let chunkText = "";

        for (const frame of frames) {
          const lines = frame.split("\n");
          let eventType = "";
          let data = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim();
            else if (line.startsWith("data: ")) data = line.slice(6);
          }

          if (eventType === "end") {
            shouldStop = true;
            break;
          }

          if (eventType === "error") {
            setMessages((prev) =>
              prev.map((m) => m.id === assistantId ? { ...m, content: data || "An error occurred." } : m)
            );
            shouldStop = true;
            break;
          }

          if (data && !eventType) {
            chunkText += data;
          }
        }

        if (chunkText) {
          setMessages((prev) =>
            prev.map((m) => m.id === assistantId ? { ...m, content: m.content + chunkText } : m)
          );
          // Yield to browser to render before processing next chunk
          await new Promise((r) => requestAnimationFrame(r));
        }

        if (shouldStop) break;
      }
    } catch {
      setMessages((prev) => {
        const hasAssistant = prev.some((m) => m.id === assistantId);
        if (hasAssistant) {
          return prev.map((m) => m.id === assistantId ? { ...m, content: "Something went wrong. Please try again." } : m);
        }
        return [...prev, { id: assistantId, content: "Something went wrong. Please try again.", role: "assistant" as const }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "group fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-card text-primary border-2 border-primary shadow-glow flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 hover:shadow-xl hover:bg-card active:scale-95",
          isOpen && "hidden"
        )}
        aria-label="Open chat assistant"
      >
        {/* Pulsing ring */}
        <span className="absolute inset-0 rounded-full border-2 border-primary/60 animate-ping opacity-60 pointer-events-none" />
        {/* Soft glow halo */}
        <span className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <BotMascot
          size={22}
          className="relative transition-transform duration-300 ease-out group-hover:rotate-[-8deg] group-hover:scale-110 group-active:scale-95"
        />
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed bottom-6 right-6 z-50 w-[340px] h-[480px] bg-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border/50 origin-bottom-right animate-[bounce-in_0.2s_ease-out]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <BotMascot size={16} className="text-primary" />
              </div>
            <div>
              <span className="font-medium text-sm text-foreground">Numo Knows 😎</span>
            </div>
            </div>
            <button
              onClick={() => messages.length === 0 ? setIsOpen(false) : setShowConfirm(true)}
              className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Confirmation overlay */}
          {showConfirm && (
            <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="text-center space-y-4">
                <p className="text-sm font-medium text-foreground">End this chat session?</p>
                <p className="text-xs text-muted-foreground">Your conversation history will be deleted.</p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
                  <Button size="sm" variant="destructive" onClick={handleClose}>End Session</Button>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div
            className={cn(
              "flex-1 min-h-0 p-4",
              messages.length === 0 && !isLoading ? "overflow-hidden" : "overflow-y-auto space-y-3"
            )}
          >
            {messages.length === 0 && (
              <div className="relative min-h-full flex flex-col items-center justify-center text-center text-muted-foreground text-sm overflow-hidden">
                {/* Floating ambient bubbles */}
                <div className="pointer-events-none absolute inset-0">
                  <span className="absolute left-[12%] top-[20%] w-2 h-2 rounded-full bg-primary/30 animate-[float_4s_ease-in-out_infinite]" />
                  <span className="absolute left-[78%] top-[28%] w-1.5 h-1.5 rounded-full bg-primary/40 animate-[float_5s_ease-in-out_infinite] [animation-delay:0.6s]" />
                  <span className="absolute left-[22%] top-[72%] w-1.5 h-1.5 rounded-full bg-primary/30 animate-[float_4.5s_ease-in-out_infinite] [animation-delay:1.2s]" />
                  <span className="absolute left-[85%] top-[78%] w-2 h-2 rounded-full bg-primary/30 animate-[float_5.5s_ease-in-out_infinite] [animation-delay:0.3s]" />
                  <span className="absolute left-[50%] top-[12%] w-1 h-1 rounded-full bg-primary/40 animate-[float_3.8s_ease-in-out_infinite] [animation-delay:1.5s]" />
                </div>

                {/* Pulsing icon with rings */}
                <div className="relative mb-3">
                  <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                  <span className="absolute -inset-2 rounded-full border border-primary/20 animate-[pulse_2s_ease-in-out_infinite]" />
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <BotMascot size={24} className="text-primary" />
                  </div>
                </div>

                <p className="font-medium text-foreground animate-fade-in">Hey there! Ready to clear some financial headspace? 👋</p>

                {/* Animated typing dots */}
                <div className="mt-4 flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[85%] px-3 py-2 rounded-2xl text-sm",
                  message.role === "user"
                    ? "ml-auto bg-muted text-foreground rounded-br-md"
                    : "bg-secondary/50 text-muted-foreground rounded-bl-md"
                )}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0 [&>pre]:my-1 [&>pre]:rounded [&>pre]:bg-muted/50 [&>pre]:p-2 [&>code]:text-xs">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-bl-md text-sm bg-muted/50 text-foreground">
                <span className="flex gap-1 py-1">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            )}
            {(messages.length > 0 || isLoading) && <div ref={messagesEndRef} />}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border/50 bg-secondary/30">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 bg-background/50 border-border/50 text-sm"
                disabled={isLoading}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="hover:bg-primary/10 text-primary disabled:text-muted-foreground"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        </>
      )}
    </>
  );
};

export default ChatBot;
