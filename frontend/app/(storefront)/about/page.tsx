import type { Metadata } from "next";
import AboutHero from "@/components/about/AboutHero";
import OurStory from "@/components/about/OurStory";
import ValuesSection from "@/components/about/ValuesSection";

export const metadata: Metadata = {
  title: "About the Atelier | Atelier & Co.",
  description: "Discover the people, materials, and principles behind Atelier & Co.",
};

export default function AboutPage() {
  return (
    <main className="bg-surface">
      <AboutHero />
      <OurStory />
      <ValuesSection />
    </main>
  );
}
