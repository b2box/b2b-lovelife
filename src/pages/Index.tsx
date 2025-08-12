import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import CategoryTabs from "@/components/landing/CategoryTabs";
import PromoBanner from "@/components/landing/PromoBanner";
import CategoryShowcase from "@/components/landing/CategoryShowcase";
import Footer from "@/components/landing/Footer";
import InfiniteProducts from "@/components/landing/InfiniteProducts";
import { useLocation } from "react-router-dom";
import HowItWorks from "@/components/landing/HowItWorks";
import PublicCTA from "@/components/landing/PublicCTA";
import NewArrivals from "@/components/landing/NewArrivals";
import TestimonialsBanner from "@/components/landing/TestimonialsBanner";
import { useSEOByMarket } from "@/hooks/useSEOByMarket";

const jsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "B2BOX - Mayorista",
  url: typeof window !== "undefined" ? window.location.origin : "",
  potentialAction: {
    "@type": "SearchAction",
    target: `${typeof window !== "undefined" ? window.location.origin : ""}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

const Index = () => {
  const location = useLocation();
  const isApp = location.pathname.startsWith("/app");
  
  // Determine market based on app route
  let market: "AR" | "CO" | "CN" = "CN";
  if (location.pathname.includes("/app/ar")) {
    market = "AR";
  } else if (location.pathname.includes("/app/co")) {
    market = "CO";
  }
  
  useSEOByMarket(market);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        {!isApp && (
          <>
            <section className="mt-4">
              <HowItWorks />
            </section>
            <section className="mt-6">
              <PromoBanner />
            </section>
            <section className="mt-6">
              <InfiniteProducts publicMode={true} />
            </section>
          </>
        )}
        {isApp && (
          <>
            <section className="mt-4">
              <CategoryTabs />
            </section>
            <section className="mt-6">
              <InfiniteProducts publicMode={false} />
            </section>
          </>
        )}
        <section className="mt-16">
          <TestimonialsBanner />
        </section>
      </main>
      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
    </div>
  );
};

export default Index;
