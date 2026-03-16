import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Upload, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

export default function KnowledgeGapsPage() {
  const { knowledgeGaps, addDocument, resolveKnowledgeGap } = useApp();
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setTimeout(() => {
      Array.from(files).forEach(file => {
        addDocument({
          id: crypto.randomUUID(),
          name: file.name,
          category: 'processes',
          uploadDate: new Date().toISOString(),
          size: file.size,
        });
        setUploadedFileName(file.name);
      });
      // Resolve all unanswered gaps
      knowledgeGaps.filter(g => g.status === 'unanswered').forEach(g => resolveKnowledgeGap(g.id));
      setUploading(false);
      setTimeout(() => setUploadedFileName(''), 3000);
    }, 1200);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Knowledge Gaps</h1>
          <p className="text-sm text-muted-foreground">Questions AWARE couldn't answer from your documents.</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs shrink-0">
          <Upload className="w-3 h-3 mr-1.5" />
          Upload to resolve a gap
        </Button>
      </div>

      {/* Info card */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
        <AlertTriangle className="w-4 h-4 text-aware-amber shrink-0 mt-0.5" />
        <p className="text-sm text-foreground/80 leading-relaxed">
          Every time AWARE can't find an answer in your documents, it's logged here. Use these gaps to decide which documents to upload next.
        </p>
      </div>

      {knowledgeGaps.length === 0 ? (
        <div className="py-16 text-center">
          <AlertTriangle className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No knowledge gaps yet. Ask AWARE some questions to get started.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Question asked</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">Status</th>
              </tr>
            </thead>
            <tbody>
              {knowledgeGaps.map((gap, i) => (
                <motion.tr
                  key={gap.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 text-sm">{gap.question}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground tabular-nums">
                    {new Date(gap.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2.5 py-1 rounded-full text-[11px] font-semibold',
                      gap.status === 'unanswered'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-green-50 text-green-600'
                    )}>
                      {gap.status === 'unanswered' ? 'Unanswered' : 'Resolved'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
