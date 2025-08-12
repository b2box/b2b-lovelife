import { useState, useEffect } from "react";
import { usePricingSettings } from "./usePricingSettings";

export type Country = "AR" | "CO" | "CN";

export function useCountryPricing() {
  const { data: pricingSettings } = usePricingSettings();
  const [country, setCountry] = useState<Country>(() => {
    return (localStorage.getItem("country") as Country) || "AR";
  });
  
  // Listen for country changes in localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "country" && e.newValue) {
        setCountry(e.newValue as Country);
      }
    };

    // Listen for changes from other tabs/components
    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events from the same tab
    const handleCountryChange = (e: CustomEvent) => {
      setCountry(e.detail);
    };
    
    window.addEventListener("countryChanged", handleCountryChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("countryChanged", handleCountryChange as EventListener);
    };
  }, []);
  
  const getCountryFromStorage = (): Country => {
    return country;
  };

  const setCountryAndNotify = (newCountry: Country) => {
    localStorage.setItem("country", newCountry);
    setCountry(newCountry);
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent("countryChanged", { detail: newCountry }));
  };

  const calculatePriceForCountry = (basePrice: number, targetCountry: Country = country) => {
    if (!pricingSettings || !basePrice) return 0;

    if (targetCountry === "AR") {
      // Para Argentina, usar el tier más alto (tier 3)
      const rate = pricingSettings.arRate;
      const percentage = pricingSettings.arPercents[2]; // tier 3 (más alto)
      return (basePrice * rate * percentage) / 100;
    } else if (targetCountry === "CO") {
      // Para Colombia, usar el tier más alto (tier 3)
      const rate = pricingSettings.coRate;
      const percentage = pricingSettings.coPercents[2]; // tier 3 (más alto)
      return (basePrice * rate * percentage) / 100;
    } else if (targetCountry === "CN") {
      // Para China/Global, usar el tier más alto (tier 3)
      const rate = pricingSettings.cnRate;
      const percentage = pricingSettings.cnPercents[2]; // tier 3 (más alto)
      return (basePrice * rate * percentage) / 100;
    }

    return basePrice;
  };

  const formatPriceForCountry = (basePrice: number, targetCountry: Country = country) => {
    const price = calculatePriceForCountry(basePrice, targetCountry);
    
    if (targetCountry === "AR") {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
    } else if (targetCountry === "CO") {
      return `$${Math.round(price).toLocaleString('es-CO', { useGrouping: true })} COP`;
    } else if (targetCountry === "CN") {
      return `¥${price.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CNY`;
    }
    
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return {
    country,
    calculatePriceForCountry,
    formatPriceForCountry,
    getCountryFromStorage,
    setCountryAndNotify
  };
}