import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Check, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AwareLogoFull } from '@/components/AwareLogo';
import { useApp } from '@/context/AppContext';

const steps = [
  {
    title: 'Tell AWARE who you are',
    description: 'Upload your company overview. This can be a one-pager, your website\'s about page, or just a typed paragraph about what your organisation does, your key teams, and your main clients.',
    category: 'overview' as const,
    accept: '.pdf,.docx,.doc,.txt,.png,.jpg,.jpeg',
  },
  {
    title: 'Your internal processes',
    description: 'Upload your SOPs, process documents, or any how-we-do-things-here guides. These help AWARE answer questions like who to go to for what, and what the correct steps are for common tasks.',
    category: 'processes' as const,
    accept: '.pdf,.docx,.doc,.txt,.png,.jpg,.jpeg',
  },
  {
    title: 'Your HR and team policies',
    description: 'Upload your leave policy, expense policy, working hours, or any HR documentation. AWARE will use these to answer policy questions accurately.',
    category: 'hr' as const,
    accept: '.pdf,.docx,.doc,.txt,.png,.jpg,.jpeg',
  },
  {
    title: 'Your client contracts and agreements',
    description: 'Upload any client SOWs, SLAs, or agreements. AWARE will use these to verify what was actually committed to each client. Multiple files are supported.',
    category: 'contracts' as const,
    accept: '.pdf,.docx,.doc,.txt,.png,.jpg,.jpeg',
    multiple: true,
  },
  {
    title: 'Your checklists',
    description: 'Upload any onboarding checklists, project kickoff checklists, QA checklists, or process templates. AWARE will surface these when relevant.',
    category: 'checklists' as const,
    accept: '.pdf,.docx,.doc,.txt,.png,.jpg,.jpeg',
    multiple: true,
  },
  {
    title: 'Your writing style',
    description: 'Upload 2 to 3 examples of emails or messages you have written in the past. These can be screenshots or photos of emails — PNG, JPG, or PDF. AWARE will use these to match your tone and phrasing when helping you draft communications.',
    category: 'style' as const,
    accept: '.pdf,.png,.jpg,.jpeg',
    optional: true,
    multiple: true,
  },
];

export default function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = welcome
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, string[]>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addDocument, addEmailSample, completeSetup } = useApp();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const step = steps[currentStep];
    const fileNames: string[] = [];

    setTimeout(() => {
      Array.from(files).forEach(file => {
        fileNames.push(file.name);
        const doc = {
          id: crypto.randomUUID(),
          name: file.name,
          category: step.category,
          uploadDate: new Date().toISOString(),
          size: file.size,
        };
        if (step.category === 'style') {
          addEmailSample(doc);
        } else {
          addDocument(doc);
        }
      });

      setUploadedFiles(prev => ({
        ...prev,
        [currentStep]: [...(prev[currentStep] || []), ...fileNames],
      }));
      setUploading(false);
    }, 1200);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeSetup();
    }
  };

  const totalSteps = steps.length;
  const filesForStep = uploadedFiles[currentStep] || [];

  if (currentStep === -1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg w-full text-center space-y-8"
        >
          <div className="flex justify-center">
            <AwareLogoFull />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Your organisation's knowledge, always at your fingertips.
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
              Before we begin, AWARE needs to learn about your organisation. We'll walk you through uploading a few documents — this takes about 5 minutes and only needs to be done once.
            </p>
          </div>

          <Button onClick={() => setCurrentStep(0)} className="h-11 px-8 bg-primary hover:brightness-95 active:scale-[0.98] transition-all duration-150">
            Get started
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    );
  }

  // Completion screen
  if (currentStep >= steps.length) {
    return null;
  }

  const step = steps[currentStep];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-lg w-full space-y-8">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            {step.optional && <span className="text-primary font-medium">Optional</span>}
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold tracking-tight">{step.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </div>

            {/* Upload area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative border-2 border-dashed border-border rounded-xl p-12 transition-colors hover:border-primary/50 flex flex-col items-center justify-center gap-4 bg-muted/30 cursor-pointer"
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Processing...</p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, PNG, JPG up to 10MB</p>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={step.accept}
                multiple={step.multiple}
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {/* Uploaded files */}
            {filesForStep.length > 0 && (
              <div className="space-y-2">
                {filesForStep.map((name, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium flex-1 truncate">{name}</span>
                    <Check className="w-4 h-4 text-aware-green" />
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={handleNext}
                className="w-full h-11 bg-primary hover:brightness-95 active:scale-[0.98] transition-all duration-150"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Finish setup
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
              <button
                onClick={handleNext}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
