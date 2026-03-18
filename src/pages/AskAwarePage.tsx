import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AwareLogo } from '@/components/AwareLogo';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const starterQuestions = [
  'What is our leave policy?',
  'What did we commit to in the Acme contract?',
  'Who do I escalate billing issues to?',
  "What's the onboarding checklist for new clients?",
];

async function streamChat({
  messages,
  documentContext,
  onDelta,
  onDone,
}: {
  messages: { role: string; content: string }[];
  documentContext: string;
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, documentContext }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${resp.status})`);
  }

  if (!resp.body) throw new Error('No response body');

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = '';
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + '\n' + textBuffer;
        break;
      }
    }
  }

  // Flush remaining buffer
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split('\n')) {
      if (!raw) continue;
      if (raw.endsWith('\r')) raw = raw.slice(0, -1);
      if (raw.startsWith(':') || raw.trim() === '') continue;
      if (!raw.startsWith('data: ')) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

export default function AskAwarePage() {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { chatMessages, addChatMessage, documents, addKnowledgeGap } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const showStarters = chatMessages.length === 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async (text?: string) => {
    const question = text || input.trim();
    if (!question || isTyping) return;
    setInput('');

    addChatMessage({ role: 'user', content: question });
    setIsTyping(true);

    // Build message history for context (last 20 messages)
    const history = chatMessages.slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    }));
    history.push({ role: 'user', content: question });

    // Build document context from uploaded documents
    const documentContext = documents.length > 0
      ? documents.map(d => `Document: "${d.name}" (Category: ${d.category}, Uploaded: ${d.uploadDate})`).join('\n')
      : '';

    let assistantContent = '';

    try {
      await streamChat({
        messages: history,
        documentContext,
        onDelta: (chunk) => {
          assistantContent += chunk;
        },
        onDone: () => {
          if (assistantContent.trim()) {
            const isNoAnswer = assistantContent.trim().startsWith('NO_ANSWER:');
            const displayContent = isNoAnswer
              ? assistantContent.replace(/^NO_ANSWER:\s*/, '').trim()
              : assistantContent;

            addChatMessage({
              role: 'assistant',
              content: displayContent,
              confidence: isNoAnswer ? 'red' : 'high',
            });

            // Auto-log knowledge gap when AI can't answer from documents
            if (isNoAnswer) {
              addKnowledgeGap(question);
            }
          }
          setIsTyping(false);
        },
      });
    } catch (e: any) {
      console.error('Chat error:', e);
      toast.error(e.message || 'Failed to get a response');
      addChatMessage({
        role: 'assistant',
        content: "Sorry, I couldn't process your request right now. Please try again.",
        confidence: 'red',
      });
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.12)-theme(spacing.16))] max-h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Ask AWARE</h1>
        <p className="text-sm text-muted-foreground">Ask anything about your organisation.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {chatMessages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role === 'assistant' && (
              <div className="shrink-0 mt-1">
                <AwareLogo size="sm" />
              </div>
            )}
            <div className={cn('max-w-[85%] space-y-2', msg.role === 'user' && 'text-right')}>
              <div
                className={cn(
                  'inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : msg.confidence === 'red'
                    ? 'bg-red-50 text-foreground border border-red-100 rounded-tl-none'
                    : 'bg-muted text-foreground rounded-tl-none'
                )}
              >
                {msg.content}
              </div>
              {msg.role === 'assistant' && msg.confidence && (
                <div className="flex items-center gap-3 pl-1">
                  {msg.confidence && (
                    <div
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                        msg.confidence === 'high' && 'bg-green-50 border-green-200 text-green-700',
                        msg.confidence === 'amber' && 'bg-amber-50 border-amber-200 text-amber-700',
                        msg.confidence === 'red' && 'bg-red-50 border-red-200 text-red-700'
                      )}
                    >
                        {msg.confidence === 'high' && 'Verified from documents'}
                        {msg.confidence === 'amber' && 'Partial answer'}
                        {msg.confidence === 'red' && 'Not found in documents'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <AwareLogo size="sm" />
            <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter chips */}
      {showStarters && (
        <div className="flex flex-wrap gap-2 pb-3">
          {starterQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 text-xs font-medium bg-muted hover:bg-primary/10 hover:text-primary rounded-full transition-colors border border-border"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about a policy, process, client, or anything else..."
            className="flex-1 h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="h-11 w-11 p-0 bg-primary hover:brightness-95 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground text-center">
          AWARE answers using AI. Responses are generated, not sourced from your documents yet.
        </p>
      </div>
    </div>
  );
}
