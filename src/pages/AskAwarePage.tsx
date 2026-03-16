import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AwareLogo } from '@/components/AwareLogo';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

const starterQuestions = [
  'What is our leave policy?',
  'What did we commit to in the Acme contract?',
  'Who do I escalate billing issues to?',
  "What's the onboarding checklist for new clients?",
];

const mockResponses: Record<string, { answer: string; source: string; confidence: 'high' | 'amber' | 'red' }> = {
  'leave': {
    answer: 'According to your HR policy, all full-time employees are entitled to 25 days of annual leave per calendar year, plus public holidays. Leave requests should be submitted at least 2 weeks in advance through the HR portal. Unused leave can be carried over up to 5 days into the next year.',
    source: 'HR Policy Document',
    confidence: 'high',
  },
  'acme': {
    answer: 'Based on the Acme Corp SOW, you committed to a 24-hour response time for Priority 1 tickets and 48 hours for Priority 2. The contract also includes monthly reporting and a quarterly business review. The engagement runs for 12 months with an option to extend.',
    source: 'Client SOW — Acme Corp',
    confidence: 'high',
  },
  'billing': {
    answer: 'Your process documents mention that billing issues should first go to the Finance team (Priya Patel). If unresolved within 48 hours, escalate to the Head of Operations. However, I noticed the escalation matrix doesn\'t specify an exact contact for the second level.',
    source: 'Internal Processes — Escalation Guide',
    confidence: 'amber',
  },
  'onboarding': {
    answer: 'The client onboarding checklist includes: 1) Signed contract received and filed, 2) Client added to CRM and project tools, 3) Kickoff meeting scheduled, 4) Project team assigned and introduced, 5) Communication channels set up, 6) Initial requirements document drafted, 7) First milestone and timeline agreed.',
    source: 'Checklists — New Client Onboarding',
    confidence: 'high',
  },
};

function getResponse(question: string) {
  const q = question.toLowerCase();
  if (q.includes('leave') || q.includes('holiday') || q.includes('vacation')) return mockResponses['leave'];
  if (q.includes('acme') || q.includes('contract') || q.includes('commit')) return mockResponses['acme'];
  if (q.includes('billing') || q.includes('escalat')) return mockResponses['billing'];
  if (q.includes('onboarding') || q.includes('checklist') || q.includes('new client')) return mockResponses['onboarding'];
  return null;
}

export default function AskAwarePage() {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { chatMessages, addChatMessage, addKnowledgeGap } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const showStarters = chatMessages.length === 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = (text?: string) => {
    const question = text || input.trim();
    if (!question) return;
    setInput('');

    addChatMessage({ role: 'user', content: question });

    setIsTyping(true);
    setTimeout(() => {
      const response = getResponse(question);
      if (response) {
        addChatMessage({
          role: 'assistant',
          content: response.answer,
          source: response.source,
          confidence: response.confidence,
        });
      } else {
        addKnowledgeGap(question);
        addChatMessage({
          role: 'assistant',
          content: "I don't have documented information to answer this. I've logged this as a knowledge gap.",
          confidence: 'red',
        });
      }
      setIsTyping(false);
    }, 1500);
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
                  'inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : msg.confidence === 'red'
                    ? 'bg-red-50 text-foreground border border-red-100 rounded-tl-none'
                    : 'bg-muted text-foreground rounded-tl-none'
                )}
              >
                {msg.content}
              </div>
              {msg.role === 'assistant' && (msg.source || msg.confidence) && (
                <div className="flex items-center gap-3 pl-1">
                  {msg.source && (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Source: <span className="text-foreground">{msg.source}</span>
                    </span>
                  )}
                  {msg.confidence && (
                    <div
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                        msg.confidence === 'high' && 'bg-green-50 border-green-200 text-green-700',
                        msg.confidence === 'amber' && 'bg-amber-50 border-amber-200 text-amber-700',
                        msg.confidence === 'red' && 'bg-red-50 border-red-200 text-red-700'
                      )}
                    >
                      {msg.confidence === 'high' && 'High confidence'}
                      {msg.confidence === 'amber' && 'Verified with caveat'}
                      {msg.confidence === 'red' && 'Knowledge gap'}
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
            disabled={!input.trim()}
            className="h-11 w-11 p-0 bg-primary hover:brightness-95 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground text-center">
          AWARE only answers from your uploaded documents. It will tell you when it doesn't know.
        </p>
      </div>
    </div>
  );
}
