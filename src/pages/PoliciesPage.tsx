import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, MessageSquare, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { readFileContent } from '@/lib/fileReader';

export default function PoliciesPage() {
  const { documents, addDocument } = useApp();
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const policies = documents.filter(d => ['hr', 'processes', 'overview'].includes(d.category));
  const contracts = documents.filter(d => d.category === 'contracts');

  const filterDocs = (docs: typeof documents) =>
    docs.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  const handleAsk = (docName: string) => {
    navigate('/');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const content = await readFileContent(file);
      addDocument({
        id: crypto.randomUUID(),
        name: file.name,
        category: 'processes',
        uploadDate: new Date().toISOString(),
        size: file.size,
        content,
      });
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const emptyState = documents.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Policies & Contracts</h1>
          <p className="text-sm text-muted-foreground">Find what was agreed and what the rules are.</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs shrink-0" onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-3 h-3 mr-1.5" />
          {uploading ? 'Uploading...' : 'Upload document'}
        </Button>
        <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg" multiple onChange={handleUpload} className="hidden" />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your policies and contracts..."
          className="w-full h-10 pl-10 pr-4 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
        />
      </div>

      {emptyState ? (
        <div className="py-16 text-center">
          <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No documents uploaded yet. Click "Upload document" above to add your policies and contracts.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Policies */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Policies</h2>
            {filterDocs(policies).length === 0 ? (
              <p className="text-sm text-muted-foreground">No policies found.</p>
            ) : (
              filterDocs(policies).map((doc, i) => (
                <DocCard key={doc.id} doc={doc} index={i} onAsk={handleAsk} />
              ))
            )}
          </div>

          {/* Contracts */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contracts</h2>
            {filterDocs(contracts).length === 0 ? (
              <p className="text-sm text-muted-foreground">No contracts found.</p>
            ) : (
              filterDocs(contracts).map((doc, i) => (
                <DocCard key={doc.id} doc={doc} index={i} onAsk={handleAsk} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DocCard({ doc, index, onAsk }: { doc: any; index: number; onAsk: (name: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl shadow-card bg-card space-y-3"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate">{doc.name}</h3>
          <p className="text-xs text-muted-foreground tabular-nums">
            Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAsk(doc.name)}
        className="w-full text-xs h-8"
      >
        <MessageSquare className="w-3 h-3 mr-1.5" />
        Ask about this document
      </Button>
    </motion.div>
  );
}
