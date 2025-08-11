import { usePricingSettings } from "./usePricingSettings";

export type Country = "AR" | "CO";

export function useCountryPricing() {
  const { data: pricingSettings } = usePricingSettings();
  
  const getCountryFromStorage = (): Country => {
    return (localStorage.getItem("country") as Country) || "AR";
  };

  const calculatePriceForCountry = (basePrice: number, country: Country = getCountryFromStorage()) => {
    if (!pricingSettings || !basePrice) return 0;

    if (country === "AR") {
      // Para Argentina, usar el tier más alto (tier 3)
      const rate = pricingSettings.arRate;
      const percentage = pricingSettings.arPercents[2]; // tier 3 (más alto)
      return (basePrice * rate * percentage) / 100;
    } else if (country === "CO") {
      // Para Colombia, usar el tier más alto (tier 3)
      const rate = pricingSettings.coRate;
      const percentage = pricingSettings.coPercents[2]; // tier 3 (más alto)
      return (basePrice * rate * percentage) / 100;
    }

    return basePrice;
  };

  const formatPriceForCountry = (basePrice: number, country: Country = getCountryFromStorage()) => {
    const price = calculatePriceForCountry(basePrice, country);
    
    if (country === "AR") {
      return `$${price.toFixed(2)} USD`;
    } else if (country === "CO") {
      return `$${price.toFixed(0)} COP`;
    }
    
    return `$${price.toFixed(2)}`;
  };

  return {
    calculatePriceForCountry,
    formatPriceForCountry,
    getCountryFromStorage
  };
}