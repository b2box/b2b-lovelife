import { useState, useEffect } from "react";

export type Market = "AR" | "CO" | "CN";

export function useGeolocation() {
  const [detectedMarket, setDetectedMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectMarket = async () => {
      try {
        // Check localStorage first
        const savedMarket = localStorage.getItem("market") as Market;
        if (savedMarket && ["AR", "CO", "CN"].includes(savedMarket)) {
          setDetectedMarket(savedMarket);
          setIsLoading(false);
          return;
        }

        // Use geolocation API for new users
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        
        let market: Market = "CN"; // Default to global
        
        if (data.country_code === "AR") {
          market = "AR";
        } else if (data.country_code === "CO") {
          market = "CO";
        }
        
        setDetectedMarket(market);
        localStorage.setItem("market", market);
      } catch (error) {
        console.log("Geolocation detection failed, using default market");
        setDetectedMarket("AR"); // Fallback to Argentina
        localStorage.setItem("market", "AR");
      } finally {
        setIsLoading(false);
      }
    };

    detectMarket();
  }, []);

  const setMarket = (market: Market) => {
    localStorage.setItem("market", market);
    setDetectedMarket(market);
    // Dispatch custom event for market changes
    window.dispatchEvent(new CustomEvent("marketChanged", { detail: market }));
  };

  return {
    detectedMarket,
    isLoading,
    setMarket
  };
}