import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import CategoryTabs from "@/components/landing/CategoryTabs";
import PromoBanner from "@/components/landing/PromoBanner";
import CategoryShowcase from "@/components/landing/CategoryShowcase";
import Footer from "@/components/landing/Footer";
import InfiniteProducts from "@/components/landing/InfiniteProducts";

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
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <section className="mt-6">
          <CategoryTabs />
        </section>
        <section className="mt-6">
          <CategoryShowcase />
        </section>
        
        <div className="mt-8">
          <PromoBanner />
        </div>

        <section className="mt-12">
          <InfiniteProducts />
        </section>
      </main>
      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
    </div>
  );
};

export default Index;
