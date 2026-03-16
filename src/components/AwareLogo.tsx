import { Brain } from 'lucide-react';

export function AwareLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14' };
  const iconSizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' };

  return (
    <div className={`${sizes[size]} rounded-xl bg-primary flex items-center justify-center`}>
      <Brain className={`${iconSizes[size]} text-primary-foreground`} />
    </div>
  );
}

export function AwareLogoFull() {
  return (
    <div className="flex items-center gap-3">
      <AwareLogo size="md" />
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">AWARE</h1>
        <p className="text-[10px] text-muted-foreground leading-none tracking-wide uppercase">Adaptive Workplace AI</p>
      </div>
    </div>
  );
}
