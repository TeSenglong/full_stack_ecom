import type { Metadata } from "next";
import AboutContent from "@/components/about/AboutContent";

export const metadata: Metadata = {
  title: "About MOHAORI | MOHAORI",
  description: "Discover the people, materials, and principles behind MOHAORI.",
};

export default function AboutPage() {
  return <AboutContent />;
}
