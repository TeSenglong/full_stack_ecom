"use client";

import { useLanguage } from "@/app/provider/languageProvider";
import AboutHero from "@/components/about/AboutHero";
import OurStory from "@/components/about/OurStory";
import DashboardSection from "@/components/about/DashboardSection";
import ValuesSection from "@/components/about/ValuesSection";

export default function AboutContent() {
  const { language } = useLanguage();

  return (
    <main
      lang={language === "kh" ? "km" : "en"}
      className="localized-content bg-surface"
    >
      <AboutHero />
      <OurStory />
      <DashboardSection />
      <ValuesSection />
    </main>
  );
}
