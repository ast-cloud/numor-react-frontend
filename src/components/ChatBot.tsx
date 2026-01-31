import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLabel, setShowLabel] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLabel(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

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

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "Sample AI reply",
      role: "assistant",
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
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
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
          {showLabel && (
            <div className="animate-[fade-slide-up_0.5s_ease-out_0.5s_both] bg-card text-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-md border border-border/50 whitespace-nowrap">
              Ask me ✨
            </div>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 rounded-full bg-secondary text-foreground shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-xl hover:bg-secondary/80"
            aria-label="Open chat assistant"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      )}

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
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="font-medium text-sm text-foreground">Assistant</span>
                <p className="text-xs text-muted-foreground">Ask me anything</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm mt-12">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <p className="font-medium text-foreground">Hi there! 👋</p>
                <p className="mt-1 text-xs">How can I help you today?</p>
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
                {message.content}
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
            <div ref={messagesEndRef} />
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
