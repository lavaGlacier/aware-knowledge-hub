import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Mail, CheckSquare, FileText, AlertTriangle, Menu } from 'lucide-react';
import { AwareLogoFull } from '@/components/AwareLogo';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Ask AWARE', path: '/', icon: MessageSquare },
  { title: 'Write an Email', path: '/email', icon: Mail },
  { title: 'Checklists', path: '/checklists', icon: CheckSquare },
  { title: 'Policies & Contracts', path: '/policies', icon: FileText },
  { title: 'Knowledge Gaps', path: '/gaps', icon: AlertTriangle },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { documents } = useApp();

  const showBanner = documents.length < 3;

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'h-screen sticky top-0 flex flex-col border-r border-border bg-sidebar transition-all duration-200',
          sidebarOpen ? 'w-[260px]' : 'w-0 overflow-hidden'
        )}
      >
        <div className="p-5 border-b border-border">
          <AwareLogoFull />
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative',
                  active
                    ? 'bg-background text-foreground shadow-card'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                )}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                )}
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-12 flex items-center border-b border-border px-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <Menu className="w-4 h-4 text-muted-foreground" />
          </button>
        </header>

        {/* Document banner */}
        {showBanner && (
          <div className="bg-accent-amber/5 border-b border-accent-amber/20 px-6 py-2.5 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-aware-amber shrink-0" />
            <p className="text-xs text-muted-foreground">
              AWARE works best with more documents.{' '}
              <button
                onClick={() => navigate('/setup')}
                className="text-primary hover:underline font-medium"
              >
                Add more in Setup
              </button>
            </p>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-12 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
