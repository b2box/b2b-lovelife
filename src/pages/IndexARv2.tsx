import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/landing/Navbar";
import HeroV2 from "@/components/landing/HeroV2";
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

const IndexARv2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isApp = location.pathname.startsWith("/app");
  useSEOByMarket("AR");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroV2 />
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
          <section className="mt-6">
            <InfiniteProducts publicMode={false} />
          </section>
        )}
        <section className="mt-16">
          <TestimonialsBanner />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default IndexARv2;
