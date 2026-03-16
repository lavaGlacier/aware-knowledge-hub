import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

export default function ChecklistsPage() {
  const { checklists, toggleChecklistItem, resetChecklist } = useApp();
  const [openChecklist, setOpenChecklist] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredChecklists = checklists.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const activeChecklist = checklists.find(c => c.id === openChecklist);

  if (activeChecklist) {
    const completed = activeChecklist.items.filter(i => i.checked).length;
    const total = activeChecklist.items.length;

    return (
      <div className="max-w-2xl space-y-6">
        <button
          onClick={() => setOpenChecklist(null)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to checklists
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{activeChecklist.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{activeChecklist.description}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => resetChecklist(activeChecklist.id)}
            className="text-xs shrink-0"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completed} of {total} complete</span>
            <span className="tabular-nums">{Math.round((completed / total) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(completed / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2">
          {activeChecklist.items.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => toggleChecklistItem(activeChecklist.id, item.id)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                item.checked
                  ? 'bg-muted/50 border-border'
                  : 'bg-background border-border hover:border-primary/30'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                item.checked
                  ? 'bg-primary border-primary'
                  : 'border-border'
              )}>
                {item.checked && <CheckSquare className="w-3 h-3 text-primary-foreground" />}
              </div>
              <span className={cn('text-sm', item.checked && 'line-through text-muted-foreground')}>
                {item.text}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Checklists</h1>
        <p className="text-sm text-muted-foreground">Your organisation's process checklists, always ready.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Describe your situation and AWARE will suggest the right checklist..."
          className="w-full h-10 pl-10 pr-4 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
        />
      </div>

      {/* Checklist cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredChecklists.map((checklist, i) => {
          const completed = checklist.items.filter(item => item.checked).length;
          return (
            <motion.div
              key={checklist.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-xl shadow-card bg-card space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckSquare className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold">{checklist.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{checklist.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {completed}/{checklist.items.length} done
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenChecklist(checklist.id)}
                  className="text-xs h-8"
                >
                  Open
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
