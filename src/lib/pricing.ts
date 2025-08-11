export type MarketKey = 'AR' | 'COL' | 'CN';
export type TierIndex = 0 | 1 | 2;

export interface MarketTier {
  percent: number;
  price: number;
}

export type Markets = {
  AR: MarketTier[];
  COL: MarketTier[];
  CN: MarketTier[];
};

export interface PricingSettingsData {
  arRate: number; // CNY -> USD for AR
  coRate: number; // CNY -> COP for COL
  cnRate: number; // CNY -> USD for CN (global buyers)
  arPercents: [number, number, number];
  coPercents: [number, number, number];
  cnPercents: [number, number, number];
}

export const defaultPricingSettings: PricingSettingsData = {
  arRate: 1,
  coRate: 1,
  cnRate: 1,
  arPercents: [300, 300, 300],
  coPercents: [200, 200, 200],
  cnPercents: [100, 100, 100],
};

export function computeMarketPrice(baseCny: number, percent: number, rate: number): number {
  return Number((baseCny * (1 + (percent || 0) / 100) * rate).toFixed(2));
}

export function computePercentFromPrice(targetPrice: number, baseCny: number, rate: number): number {
  if (!baseCny || !rate) return 0;
  return Number((((targetPrice / (baseCny * rate)) - 1) * 100).toFixed(2));
}

export function ensureMarkets(current: any, baseTiers: number[], settings: PricingSettingsData): Markets {
  return {
    AR: [0, 1, 2].map((i) => {
      const percent = current?.AR?.[i]?.percent ?? settings.arPercents[i];
      const price = computeMarketPrice(baseTiers[i] || 0, percent, settings.arRate);
      return { percent, price };
    }),
    COL: [0, 1, 2].map((i) => {
      const percent = current?.COL?.[i]?.percent ?? settings.coPercents[i];
      const price = computeMarketPrice(baseTiers[i] || 0, percent, settings.coRate);
      return { percent, price };
    }),
    CN: [0, 1, 2].map((i) => {
      const percent = current?.CN?.[i]?.percent ?? settings.cnPercents[i];
      const price = computeMarketPrice(baseTiers[i] || 0, percent, settings.cnRate);
      return { percent, price };
    }),
  };
}

export function recomputeMarkets(current: any, baseTiers: number[], settings: PricingSettingsData): Markets {
  const cur = current || {};
  return {
    AR: [0, 1, 2].map((i) => {
      const percent = cur?.AR?.[i]?.percent ?? settings.arPercents[i];
      const price = computeMarketPrice(baseTiers[i] || 0, percent, settings.arRate);
      return { percent, price };
    }),
    COL: [0, 1, 2].map((i) => {
      const percent = cur?.COL?.[i]?.percent ?? settings.coPercents[i];
      const price = computeMarketPrice(baseTiers[i] || 0, percent, settings.coRate);
      return { percent, price };
    }),
    CN: [0, 1, 2].map((i) => {
      const percent = cur?.CN?.[i]?.percent ?? settings.cnPercents[i];
      const price = computeMarketPrice(baseTiers[i] || 0, percent, settings.cnRate);
      return { percent, price };
    }),
  };
}
