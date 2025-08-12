import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useGeolocation, type Market } from "@/hooks/useGeolocation";

interface MarketContextType {
  market: Market;
  setMarket: (market: Market) => void;
  isLoading: boolean;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export function MarketProvider({ children }: { children: ReactNode }) {
  const { detectedMarket, isLoading, setMarket: setDetectedMarket } = useGeolocation();
  const [market, setMarketState] = useState<Market>("CN"); // Default to CN (global)

  useEffect(() => {
    if (detectedMarket && !isLoading) {
      setMarketState(detectedMarket);
    }
  }, [detectedMarket, isLoading]);

  useEffect(() => {
    const handleMarketChange = (e: CustomEvent) => {
      setMarketState(e.detail);
    };
    
    window.addEventListener("marketChanged", handleMarketChange as EventListener);
    
    return () => {
      window.removeEventListener("marketChanged", handleMarketChange as EventListener);
    };
  }, []);

  const setMarket = (newMarket: Market) => {
    setDetectedMarket(newMarket);
    setMarketState(newMarket);
  };

  return (
    <MarketContext.Provider value={{ market, setMarket, isLoading }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (context === undefined) {
    throw new Error("useMarket must be used within a MarketProvider");
  }
  return context;
}