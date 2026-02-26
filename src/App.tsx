
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import IndexAR from "./pages/IndexAR";
import IndexCO from "./pages/IndexCO";
import IndexCN from "./pages/IndexCN";
import IndexARv2 from "./pages/IndexARv2";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ProductView from "./pages/ProductView";
import ShopifyProduct from "./pages/ShopifyProduct";
import Admin from "./pages/Admin";
import { MarketProvider } from "./contexts/MarketContext";

const queryClient = new QueryClient();

console.log('App.tsx loading...');
const App = () => {
  console.log('App component rendering...');
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MarketProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<IndexCN />} />
              <Route path="/ar" element={<IndexAR />} />
              <Route path="/ar-v2" element={<IndexARv2 />} />
              <Route path="/co" element={<IndexCO />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/app" element={<Index />} />
              <Route path="/app/ar" element={<Index />} />
              <Route path="/app/co" element={<Index />} />
              {/* Shopify product routes */}
              <Route path="/product/:handle" element={<ShopifyProduct />} />
              {/* Product routes with /app prefix */}
              <Route path="/app/product/:slug" element={<ProductView />} />
              <Route path="/app/ar/product/:slug" element={<ProductView />} />
              <Route path="/app/co/product/:slug" element={<ProductView />} />
              {/* Product routes without /app prefix for direct access */}
              <Route path="/ar/product/:slug" element={<ProductView />} />
              <Route path="/co/product/:slug" element={<ProductView />} />
              {/* Fallback routes for ID-based URLs */}
              <Route path="/app/product/id/:id" element={<ProductView />} />
              <Route path="/app/ar/product/id/:id" element={<ProductView />} />
              <Route path="/app/co/product/id/:id" element={<ProductView />} />
              <Route path="/product/id/:id" element={<ProductView />} />
              <Route path="/ar/product/id/:id" element={<ProductView />} />
              <Route path="/co/product/id/:id" element={<ProductView />} />
              <Route path="/app/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </MarketProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

