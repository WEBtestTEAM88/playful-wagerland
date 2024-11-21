import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { VolumeProvider } from "./contexts/VolumeContext";
import { VolumeControl } from "./components/VolumeControl";
import Index from "./pages/Index";
import AdminPanel from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <UserProvider>
    <VolumeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <VolumeControl />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </VolumeProvider>
  </UserProvider>
);

export default App;