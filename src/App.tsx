import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/context/AppContext";
import SetupWizard from "@/components/SetupWizard";
import AppLayout from "@/components/AppLayout";
import AskAwarePage from "@/pages/AskAwarePage";
import WriteEmailPage from "@/pages/WriteEmailPage";
import ChecklistsPage from "@/pages/ChecklistsPage";
import PoliciesPage from "@/pages/PoliciesPage";
import KnowledgeGapsPage from "@/pages/KnowledgeGapsPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function AppContent() {
  const { setupComplete } = useApp();

  if (!setupComplete) {
    return <SetupWizard />;
  }

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<AskAwarePage />} />
          <Route path="/email" element={<WriteEmailPage />} />
          <Route path="/checklists" element={<ChecklistsPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/gaps" element={<KnowledgeGapsPage />} />
          <Route path="/setup" element={<SetupWizard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AppProvider>
        <AppContent />
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
