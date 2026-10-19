import type { Metadata } from "next";
import AboutHero from "@/components/about/AboutHero";
import OurStory from "@/components/about/OurStory";
import ValuesSection from "@/components/about/ValuesSection";
import DashboardSection from "@/components/about/DashboardSection";

export const metadata: Metadata = {
  title: "About MOHAORI | MOHAORI",
  description: "Discover the people, materials, and principles behind MOHAORI.",
};

export default function AboutPage() {
  return (
    <main className="bg-surface">
      <AboutHero />
      <OurStory />
      <DashboardSection />
      <ValuesSection />
    </main>
  );
}
