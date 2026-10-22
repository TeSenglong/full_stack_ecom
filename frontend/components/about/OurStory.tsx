"use client";

import Image from "next/image";
import { useLanguage } from "@/app/provider/languageProvider";

export default function OurStory() {
  const { messages } = useLanguage();
  const text = messages.about.story;

  return (
    <section id="story" className="bg-surface-low py-24">
      <div className="mx-auto max-w-350 px-5 md:px-8 lg:px-12">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-secondary">{text.eyebrow}</span>
            <h2 className="mt-2 font-serif text-4xl font-semibold leading-tight text-primary md:text-5xl">{text.title}</h2>
            {text.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={`${index === 0 ? "mt-6 text-[17px]" : "mt-4 text-[15px]"} leading-relaxed text-on-surface-variant`}
              >
                {paragraph}
              </p>
            ))}
          </div>
          <div data-aos="fade-left"
            data-aos-once="false"
            data-aos-mirror="true"
            suppressHydrationWarning
            className="lg:col-span-7">
            <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-surface-container shadow-lg">
              <Image
                src="https://lzfudmcajnsccibezqgb.supabase.co/storage/v1/object/public/image/Minimal%20Full-Stack%20Architecture%20Diagram.png"
                alt={text.imageAlt}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                loading="lazy"
                className="object-cover"
              />
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}
