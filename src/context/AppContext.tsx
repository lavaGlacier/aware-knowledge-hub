import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UploadedDocument {
  id: string;
  name: string;
  category: 'overview' | 'processes' | 'hr' | 'contracts' | 'checklists' | 'style';
  uploadDate: string;
  size: number;
  content?: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  type: 'Employee' | 'Client' | 'Vendor';
  initials: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: string;
  confidence?: 'high' | 'amber' | 'red';
  timestamp: string;
}

export interface KnowledgeGap {
  id: string;
  question: string;
  date: string;
  status: 'unanswered' | 'resolved';
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Checklist {
  id: string;
  name: string;
  description: string;
  items: ChecklistItem[];
}

interface AppState {
  setupComplete: boolean;
  documents: UploadedDocument[];
  contacts: Contact[];
  chatMessages: ChatMessage[];
  knowledgeGaps: KnowledgeGap[];
  checklists: Checklist[];
  emailSamples: UploadedDocument[];
  emailStyleEnabled: boolean;
}

interface AppContextType extends AppState {
  completeSetup: () => void;
  addDocument: (doc: UploadedDocument) => void;
  addContact: (contact: Omit<Contact, 'id' | 'initials'>) => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  addKnowledgeGap: (question: string) => void;
  resolveKnowledgeGap: (id: string) => void;
  addChecklist: (checklist: Omit<Checklist, 'id'>) => void;
  toggleChecklistItem: (checklistId: string, itemId: string) => void;
  resetChecklist: (checklistId: string) => void;
  addEmailSample: (doc: UploadedDocument) => void;
  removeEmailSample: (id: string) => void;
  setEmailStyleEnabled: (enabled: boolean) => void;
}

const defaultContacts: Contact[] = [
  { id: '1', name: 'Sarah Chen', role: 'Head of HR', type: 'Employee', initials: 'SC' },
  { id: '2', name: 'Marcus Johnson', role: 'Engineering Lead', type: 'Employee', initials: 'MJ' },
  { id: '3', name: 'Priya Patel', role: 'Finance Manager', type: 'Employee', initials: 'PP' },
  { id: '4', name: 'David Kim', role: 'Account Manager — Acme Corp', type: 'Client', initials: 'DK' },
  { id: '5', name: 'Lisa Wong', role: 'CEO — TechVentures', type: 'Client', initials: 'LW' },
  { id: '6', name: 'James Brown', role: 'Facilities Vendor', type: 'Vendor', initials: 'JB' },
];

const defaultChecklists: Checklist[] = [
  {
    id: '1',
    name: 'New Client Onboarding',
    description: 'Steps to onboard a new client from contract signing to first delivery.',
    items: [
      { id: '1', text: 'Signed contract received and filed', checked: false },
      { id: '2', text: 'Client added to CRM and project management tools', checked: false },
      { id: '3', text: 'Kickoff meeting scheduled', checked: false },
      { id: '4', text: 'Project team assigned and introduced', checked: false },
      { id: '5', text: 'Communication channels set up (Slack/email)', checked: false },
      { id: '6', text: 'Initial requirements document drafted', checked: false },
      { id: '7', text: 'First milestone and timeline agreed', checked: false },
    ],
  },
  {
    id: '2',
    name: 'New Employee Onboarding',
    description: 'Complete checklist for onboarding new team members.',
    items: [
      { id: '1', text: 'Offer letter signed and returned', checked: false },
      { id: '2', text: 'Laptop and equipment ordered', checked: false },
      { id: '3', text: 'Email and accounts created', checked: false },
      { id: '4', text: 'Welcome meeting with team scheduled', checked: false },
      { id: '5', text: 'HR policies reviewed and acknowledged', checked: false },
      { id: '6', text: 'Buddy/mentor assigned', checked: false },
    ],
  },
  {
    id: '3',
    name: 'Project QA Checklist',
    description: 'Quality assurance steps before any project delivery.',
    items: [
      { id: '1', text: 'All deliverables reviewed against requirements', checked: false },
      { id: '2', text: 'Peer review completed', checked: false },
      { id: '3', text: 'Testing completed and documented', checked: false },
      { id: '4', text: 'Client approval obtained', checked: false },
      { id: '5', text: 'Documentation updated', checked: false },
    ],
  },
];

const STORAGE_KEY = 'aware-app-state';

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    setupComplete: false,
    documents: [],
    contacts: defaultContacts,
    chatMessages: [],
    knowledgeGaps: [],
    checklists: defaultChecklists,
    emailSamples: [],
    emailStyleEnabled: false,
  };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const completeSetup = () => setState(s => ({ ...s, setupComplete: true }));

  const addDocument = (doc: UploadedDocument) =>
    setState(s => ({ ...s, documents: [...s.documents, doc] }));

  const addContact = (contact: Omit<Contact, 'id' | 'initials'>) =>
    setState(s => ({
      ...s,
      contacts: [...s.contacts, {
        ...contact,
        id: crypto.randomUUID(),
        initials: getInitials(contact.name),
      }],
    }));

  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) =>
    setState(s => ({
      ...s,
      chatMessages: [...s.chatMessages, {
        ...msg,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      }],
    }));

  const addKnowledgeGap = (question: string) =>
    setState(s => ({
      ...s,
      knowledgeGaps: [...s.knowledgeGaps, {
        id: crypto.randomUUID(),
        question,
        date: new Date().toISOString(),
        status: 'unanswered',
      }],
    }));

  const resolveKnowledgeGap = (id: string) =>
    setState(s => ({
      ...s,
      knowledgeGaps: s.knowledgeGaps.map(g => g.id === id ? { ...g, status: 'resolved' as const } : g),
    }));

  const addChecklist = (checklist: Omit<Checklist, 'id'>) =>
    setState(s => ({
      ...s,
      checklists: [...s.checklists, { ...checklist, id: crypto.randomUUID() }],
    }));

  const toggleChecklistItem = (checklistId: string, itemId: string) =>
    setState(s => ({
      ...s,
      checklists: s.checklists.map(c =>
        c.id === checklistId
          ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i) }
          : c
      ),
    }));

  const resetChecklist = (checklistId: string) =>
    setState(s => ({
      ...s,
      checklists: s.checklists.map(c =>
        c.id === checklistId
          ? { ...c, items: c.items.map(i => ({ ...i, checked: false })) }
          : c
      ),
    }));

  const addEmailSample = (doc: UploadedDocument) =>
    setState(s => ({ ...s, emailSamples: [...s.emailSamples, doc] }));

  const removeEmailSample = (id: string) =>
    setState(s => ({ ...s, emailSamples: s.emailSamples.filter(d => d.id !== id) }));

  const setEmailStyleEnabled = (enabled: boolean) =>
    setState(s => ({ ...s, emailStyleEnabled: enabled }));

  return (
    <AppContext.Provider value={{
      ...state,
      completeSetup,
      addDocument,
      addContact,
      addChatMessage,
      addKnowledgeGap,
      resolveKnowledgeGap,
      addChecklist,
      toggleChecklistItem,
      resetChecklist,
      addEmailSample,
      removeEmailSample,
      setEmailStyleEnabled,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
