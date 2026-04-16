import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/store/appStore";
import Index from "./pages/Index";
import Dispatch from "./pages/Dispatch";
import Kassa from "./pages/Kassa";
import Prodazhi from "./pages/Prodazhi";
import Kadry from "./pages/Kadry";
import Settings from "./pages/Settings";
import Vedomost from "./pages/Vedomost";
import Ts from "./pages/Ts";
import Terminals from "./pages/Terminals";
import Bdd from "./pages/Bdd";
import Tb from "./pages/Tb";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dispatch" element={<Dispatch />} />
            <Route path="/kassa" element={<Kassa />} />
            <Route path="/prodazhi" element={<Prodazhi />} />
            <Route path="/kadry" element={<Kadry />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/vedomost" element={<Vedomost />} />
            <Route path="/ts" element={<Ts />} />
            <Route path="/terminals" element={<Terminals />} />
            <Route path="/bdd" element={<Bdd />} />
            <Route path="/tb" element={<Tb />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;