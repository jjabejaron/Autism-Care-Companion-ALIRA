import AppShell from "@/components/AppShell";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageCircle, Sparkles } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
};

const SUGGESTED_QUESTIONS = [
  "How can I help my child with transitions?",
  "What are some sensory activities for toddlers?",
  "How do I handle meltdowns calmly?",
  "What is DIR/Floortime therapy?",
  "How can I improve my child's communication?",
  "What are signs of autism in young children?",
];

export default function Chat() {
  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const { data: history = [], isLoading } = trpc.chat.history.useQuery();
  const utils = trpc.useUtils();

  const sendMessage = trpc.chat.send.useMutation({
    onMutate: (variables) => {
      // Optimistic update
      const tempUserMsg: Message = {
        id: Date.now(),
        role: "user",
        content: variables.message,
        createdAt: new Date(),
      };
      setLocalMessages((prev) => [...prev, tempUserMsg]);
    },
    onSuccess: (data) => {
      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.message,
        createdAt: new Date(),
      };
      setLocalMessages((prev) => [...prev, assistantMsg]);
      utils.chat.history.invalidate();
    },
    onError: () => {
      toast.error("ALI is unavailable right now. Please try again.");
      setLocalMessages((prev) => prev.slice(0, -1));
    },
  });

  type HistoryItem = { id: number; role: string; content: string; createdAt: Date | string };
  const allMessages: Message[] = [
    ...history.map((h: HistoryItem) => ({ id: h.id, role: h.role as "user" | "assistant", content: h.content, createdAt: new Date(h.createdAt) })),
    ...localMessages.filter((m) => !history.some((h: HistoryItem) => h.content === m.content && h.role === m.role)),
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  const handleSend = (msg?: string) => {
    const text = msg ?? input.trim();
    if (!text || sendMessage.isPending) return;
    setInput("");
    sendMessage.mutate({ message: text });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border flex-shrink-0 bg-background">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold text-foreground">ALI</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {t.chat.subtitle}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {/* Welcome message */}
          {allMessages.length === 0 && !isLoading && (
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg">
                  <p className="text-sm text-foreground leading-relaxed">
                    {t.chat.welcome}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-3">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="text-xs px-3 py-2 rounded-full bg-primary/8 text-primary hover:bg-primary/15 transition-colors border border-primary/20"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Message history */}
          <div className="max-w-2xl mx-auto space-y-4">
            {allMessages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageCircle className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border border-border text-foreground rounded-tl-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none text-foreground">
                      <Streamdown>{msg.content}</Streamdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">Y</span>
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {sendMessage.isPending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-border bg-background px-4 py-4">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Input
              ref={inputRef}
              placeholder={t.chat.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sendMessage.isPending}
              className="flex-1"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || sendMessage.isPending}
              className="flex-shrink-0"
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            ALI provides general guidance. Always consult a licensed professional for medical decisions.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
