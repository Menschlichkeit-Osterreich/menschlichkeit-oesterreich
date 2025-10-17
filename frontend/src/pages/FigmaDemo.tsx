import React from 'react';
import HeroSection from '@/components/figma/HeroSection';
import FeaturesGrid from '@/components/figma/FeaturesGrid';
import CtaSection from '@/components/figma/CtaSection';
import Footer from '@/components/figma/Footer';

export default function FigmaDemo() {
  return (
    <div data-testid="figma-demo" className="min-h-screen flex flex-col">
      <header>
        <h1 className="sr-only">Figma Demo</h1>
      </header>
      <main id="main" className="flex-1">
        <section aria-labelledby="hero-heading" className="border-b">
          <h2 id="hero-heading" className="sr-only">Hero</h2>
          <HeroSection />
        </section>
        <section aria-labelledby="features-heading" className="border-b">
          <h2 id="features-heading" className="sr-only">Features</h2>
          <FeaturesGrid />
        </section>
        <section aria-labelledby="cta-heading" className="border-b">
          <h2 id="cta-heading" className="sr-only">Call to Action</h2>
          <CtaSection />
        </section>
      </main>
      <Footer />
    </div>
  );
}
