import { ArrowUpRight } from "lucide-react";
import { useProductMarketContent } from "@/hooks/useProductMarketContent";

interface MarketSpecificBannersProps {
  className?: string;
}

export function MarketSpecificBanners({ className }: MarketSpecificBannersProps) {
  const { content } = useProductMarketContent();

  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 bg-brand-yellow rounded-b-[28px] ${className || ""}`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <span>{content.trendBanner.text}</span>
        <img 
          src={content.trendBanner.platform.logo} 
          alt={content.trendBanner.platform.name} 
          className="h-5 w-auto" 
          loading="lazy" 
        />
      </div>
      <button className="inline-flex items-center gap-2 text-sm font-medium" aria-label={`${content.trendsButton.text} Trends`}>
        <span>{content.trendsButton.text}</span>
        <img 
          src={content.trendsButton.logo} 
          alt="Logo Trends" 
          className="h-5 w-auto" 
          loading="lazy" 
        />
        <span className="grid size-8 place-items-center rounded-full border border-black/30 text-black/70 bg-white/70 hover:bg-white">
          <ArrowUpRight />
        </span>
      </button>
    </div>
  );
}