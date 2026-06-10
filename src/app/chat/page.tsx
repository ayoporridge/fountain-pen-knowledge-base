"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { ArrowLeft, PaperPlaneRight, ChatCircleDots, Sparkle, ArrowSquareOut } from "@phosphor-icons/react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const EXAMPLE_QUESTIONS = [
  "推荐一支500以内的日系钢笔",
  "活塞上墨和旋转上墨有什么区别？",
  "百乐 Custom 823 和 743 怎么选？",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `错误: ${err.error || "请求失败"}` },
        ]);
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                setMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                  return next;
                });
              }
            } catch {
              // skip invalid JSON
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "网络错误，请重试" },
      ]);
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [input, loading, messages, scrollToBottom]);

  const renderContent = (content: string) => {
    const parts = content.split(/(\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <Link
            key={i}
            href={linkMatch[2]}
            style={{ color: "var(--color-accent)" }}
            className="hover:underline"
          >
            {linkMatch[1]}
          </Link>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm flex items-center gap-1 transition-colors"
          style={{ color: "var(--color-ink-muted)" }}
        >
          <ArrowLeft size={14} />
          首页
        </Link>
        <h1
          className="text-lg font-semibold flex items-center gap-2"
          style={{ color: "var(--color-ink)" }}
        >
          <ChatCircleDots size={20} weight="duotone" />
          问 AI
        </h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <Sparkle
              size={48}
              weight="duotone"
              style={{ color: "var(--color-accent)" }}
              className="mx-auto mb-4"
            />
            <p
              className="text-lg mb-2"
              style={{ color: "var(--color-ink)" }}
            >
              你好！我是钢笔知识图谱的 AI 助手
            </p>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--color-ink-muted)" }}
            >
              试试问我：
            </p>
            <div className="space-y-2">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setInput(q)}
                  className="block mx-auto px-4 py-2 text-sm rounded-full transition-colors btn-press"
                  style={{
                    backgroundColor: "var(--color-surface-dim)",
                    color: "var(--color-ink-light)",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
              style={
                msg.role === "user"
                  ? {
                      backgroundColor: "var(--color-accent)",
                      color: "#fff",
                      borderRadius: "1rem 1rem 0.25rem 1rem",
                    }
                  : {
                      backgroundColor: "var(--color-surface-raised)",
                      color: "var(--color-ink)",
                      border: "1px solid var(--color-border-light)",
                      borderRadius: "1rem 1rem 1rem 0.25rem",
                    }
              }
            >
              {msg.role === "assistant" ? renderContent(msg.content) : msg.content}
            </div>
          </div>
        ))}

        {loading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div
              className="px-4 py-3 rounded-2xl rounded-bl-md"
              style={{
                backgroundColor: "var(--color-surface-raised)",
                border: "1px solid var(--color-border-light)",
              }}
            >
              <span
                className="animate-pulse"
                style={{ color: "var(--color-ink-muted)" }}
              >
                思考中...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="问关于钢笔的任何问题..."
          className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none focus-ring-accent transition-colors"
          style={{
            backgroundColor: "var(--color-surface-raised)",
            border: "1px solid var(--color-border)",
            color: "var(--color-ink)",
          }}
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-xl text-white transition-colors btn-press flex items-center gap-2"
          style={{
            backgroundColor: "var(--color-accent)",
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          <PaperPlaneRight size={16} />
          发送
        </button>
      </div>
    </div>
  );
}
