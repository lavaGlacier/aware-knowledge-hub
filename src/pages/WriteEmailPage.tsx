import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Mail, Upload, FileText, Copy, RefreshCw, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp, Contact } from '@/context/AppContext';
import { cn } from '@/lib/utils';

type Tone = 'professional' | 'warm' | 'formal';

export default function WriteEmailPage() {
  const { contacts, addContact, emailSamples, addEmailSample, removeEmailSample, emailStyleEnabled, setEmailStyleEnabled, documents } = useApp();

  const [selectedRecipients, setSelectedRecipients] = useState<Contact[]>([]);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newType, setNewType] = useState<'Employee' | 'Client' | 'Vendor'>('Employee');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState<Tone>('professional');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [styleExpanded, setStyleExpanded] = useState(false);
  const [draft, setDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredContacts = contacts.filter(c =>
    !selectedRecipients.find(r => r.id === c.id) &&
    (c.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
     c.role.toLowerCase().includes(recipientSearch.toLowerCase()))
  );

  const employees = filteredContacts.filter(c => c.type === 'Employee');
  const vendorsClients = filteredContacts.filter(c => c.type !== 'Employee');

  const handleAddPerson = () => {
    if (!newName.trim()) return;
    addContact({ name: newName, role: newRole, type: newType });
    const newContact: Contact = {
      id: crypto.randomUUID(),
      name: newName,
      role: newRole,
      type: newType,
      initials: newName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    };
    setSelectedRecipients(prev => [...prev, newContact]);
    setNewName('');
    setNewRole('');
    setShowAddForm(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      addEmailSample({
        id: crypto.randomUUID(),
        name: file.name,
        category: 'style',
        uploadDate: new Date().toISOString(),
        size: file.size,
      });
    });
  };

  const generateDraft = () => {
    setGenerating(true);
    const recipientNames = selectedRecipients.map(r => r.name).join(', ');
    setTimeout(() => {
      const toneMap = {
        professional: 'clear and professional',
        warm: 'warm yet direct',
        formal: 'formal and structured',
      };
      setDraft(
        `Dear ${recipientNames || 'Team'},\n\nI hope this message finds you well.\n\n${context ? `Regarding ${context.slice(0, 80).toLowerCase()}, I wanted to reach out to discuss the next steps.` : 'I wanted to reach out regarding an important matter.'}\n\nBased on our current agreements and processes, I believe we should schedule a brief meeting to align on priorities and ensure we're tracking against our commitments.\n\nPlease let me know your availability this week, and I'll send over a calendar invite.\n\nBest regards`
      );
      setGenerating(false);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDoc = (id: string) => {
    setSelectedDocs(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Write an Email</h1>
        <p className="text-sm text-muted-foreground">Context-rich drafts based on your documents and your writing style.</p>
      </div>

      {/* Recipient field */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Who is this email to?</label>
        <div className="relative">
          <div
            onClick={() => setShowDropdown(true)}
            className="min-h-[44px] flex flex-wrap items-center gap-2 p-2 border border-border rounded-xl bg-background cursor-text focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all"
          >
            {selectedRecipients.map(r => (
              <span key={r.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                {r.name}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-foreground"
                  onClick={(e) => { e.stopPropagation(); setSelectedRecipients(prev => prev.filter(p => p.id !== r.id)); }}
                />
              </span>
            ))}
            <input
              value={recipientSearch}
              onChange={(e) => { setRecipientSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder={selectedRecipients.length === 0 ? 'Search contacts...' : ''}
              className="flex-1 min-w-[120px] text-sm bg-transparent outline-none"
            />
          </div>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute z-50 top-full mt-1 w-full bg-background border border-border rounded-xl shadow-card max-h-64 overflow-y-auto"
              >
                {employees.length > 0 && (
                  <div className="p-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1 font-semibold">Employees</p>
                    {employees.map(c => (
                      <ContactRow key={c.id} contact={c} onSelect={() => { setSelectedRecipients(prev => [...prev, c]); setRecipientSearch(''); setShowDropdown(false); }} />
                    ))}
                  </div>
                )}
                {vendorsClients.length > 0 && (
                  <div className="p-2 border-t border-border">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1 font-semibold">Clients & Vendors</p>
                    {vendorsClients.map(c => (
                      <ContactRow key={c.id} contact={c} onSelect={() => { setSelectedRecipients(prev => [...prev, c]); setRecipientSearch(''); setShowDropdown(false); }} />
                    ))}
                  </div>
                )}
                <div className="border-t border-border p-2">
                  {!showAddForm ? (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="w-full flex items-center gap-2 p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add new person — save for future emails
                    </button>
                  ) : (
                    <div className="space-y-2 p-2">
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Full name"
                        className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                      <input
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="Role or company"
                        className="w-full text-sm px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                      <div className="flex gap-1">
                        {(['Employee', 'Client', 'Vendor'] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => setNewType(t)}
                            className={cn(
                              'flex-1 text-xs py-1.5 rounded-md border transition-colors',
                              newType === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted'
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <Button onClick={handleAddPerson} size="sm" className="w-full bg-primary hover:brightness-95">
                        Save
                      </Button>
                    </div>
                  )}
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { setShowDropdown(false); setShowAddForm(false); }}
                    className="w-full text-xs text-center py-1.5 text-muted-foreground hover:text-foreground"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Context */}
      <div className="space-y-2">
        <label className="text-sm font-medium">What is this email about?</label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Describe the situation. Include as much context as you like — what happened, what you need, any relevant background."
          rows={4}
          className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
        />
      </div>

      {/* Tone */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Tone</label>
        <div className="flex gap-2">
          {([['professional', 'Professional'], ['warm', 'Warm & direct'], ['formal', 'Formal']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTone(key)}
              className={cn(
                'px-4 py-2 text-sm rounded-lg border transition-all duration-150',
                tone === key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:bg-muted'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reference docs */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Reference documents</label>
          <div className="flex flex-wrap gap-2">
            {documents.map(doc => (
              <button
                key={doc.id}
                onClick={() => toggleDoc(doc.id)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-full border transition-all',
                  selectedDocs.includes(doc.id)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                )}
              >
                {doc.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Email style */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setStyleExpanded(!styleExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <div className="text-left">
              <p className="text-sm font-medium">Your email style</p>
              <p className="text-xs text-muted-foreground">AWARE matches your tone using these samples</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{emailSamples.length} samples</span>
            <button
              onClick={(e) => { e.stopPropagation(); setEmailStyleEnabled(!emailStyleEnabled); }}
              className={cn(
                'w-9 h-5 rounded-full transition-colors relative',
                emailStyleEnabled ? 'bg-primary' : 'bg-border'
              )}
            >
              <div className={cn(
                'absolute top-0.5 w-4 h-4 bg-background rounded-full transition-transform shadow-sm',
                emailStyleEnabled ? 'translate-x-4' : 'translate-x-0.5'
              )} />
            </button>
            <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', styleExpanded && 'rotate-180')} />
          </div>
        </button>

        <AnimatePresence>
          {styleExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="p-4 space-y-3">
                {emailSamples.length > 0 ? (
                  emailSamples.map(sample => (
                    <div key={sample.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm flex-1 truncate">{sample.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{new Date(sample.uploadDate).toLocaleDateString()}</span>
                      <button onClick={() => removeEmailSample(sample.id)} className="text-xs text-destructive hover:underline">Remove</button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Upload 2 to 3 past emails to help AWARE match your tone. Screenshots or photos work perfectly.</p>
                )}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-border rounded-lg p-4 flex items-center gap-3 hover:border-primary/50 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Upload more email samples</p>
                    <p className="text-xs text-muted-foreground">Screenshots or photos of past emails</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" multiple onChange={handleFileUpload} className="hidden" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Generate */}
      <Button
        onClick={generateDraft}
        disabled={generating}
        className="w-full h-12 bg-primary hover:brightness-95 active:scale-[0.99] transition-all text-sm font-medium"
      >
        {generating ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            Drafting...
          </div>
        ) : 'Draft this email'}
      </Button>

      {/* Draft preview */}
      {draft && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border overflow-hidden"
        >
          <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Draft</p>
              <p className="text-xs text-muted-foreground">
                {emailStyleEnabled && emailSamples.length > 0
                  ? `Matched to your writing style · ${emailSamples.length} samples used`
                  : 'No style samples — using document tone'}
              </p>
            </div>
          </div>
          <div className="p-6 border-l-4 border-primary bg-muted/10">
            <pre className="text-sm leading-relaxed whitespace-pre-wrap font-[inherit]">{draft}</pre>
          </div>
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Referenced: {selectedDocs.length > 0 ? `${selectedDocs.length} documents` : 'General knowledge'}
              {emailStyleEnabled && emailSamples.length > 0 ? ` · ${emailSamples.length} email samples` : ''}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs">
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant="outline" size="sm" onClick={generateDraft} className="text-xs">
                <RefreshCw className="w-3 h-3 mr-1" />
                Regenerate
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ContactRow({ contact, onSelect }: { contact: Contact; onSelect: () => void }) {
  const colorMap = {
    Employee: 'bg-blue-100 text-blue-700',
    Client: 'bg-emerald-100 text-emerald-700',
    Vendor: 'bg-emerald-100 text-emerald-700',
  };
  const pillMap = {
    Employee: 'bg-blue-50 text-blue-700 border-blue-100',
    Client: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Vendor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold', colorMap[contact.type])}>
          {contact.initials}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium">{contact.name}</p>
          <p className="text-xs text-muted-foreground">{contact.role}</p>
        </div>
      </div>
      <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', pillMap[contact.type])}>
        {contact.type}
      </span>
    </button>
  );
}
