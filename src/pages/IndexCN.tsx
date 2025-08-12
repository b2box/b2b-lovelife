import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

const IndexCN = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isApp = location.pathname.startsWith("/app");
  useSEOByMarket("CN");

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        navigate("/app", { replace: true });
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        navigate("/app", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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

export default IndexCN;