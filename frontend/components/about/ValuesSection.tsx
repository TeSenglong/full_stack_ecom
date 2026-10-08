import Link from "next/link";

const VALUES = [
  { icon: "handyman", title: "Craft before scale", text: "We choose specialist workshops and production rhythms that protect skill, precision, and working dignity." },
  { icon: "forest", title: "Material honesty", text: "Natural, recycled, and traceable materials are selected for how beautifully they perform and age." },
  { icon: "cycle", title: "A longer life", text: "Repairability and timeless construction guide every decision, from replaceable parts to enduring finishes." },
  { icon: "travel_explore", title: "Visible origins", text: "We document where an object comes from, who made it, and why its process matters." },
];

export default function ValuesSection() {
  return (
    <section id="values" className="py-24">
      <div className="mx-auto max-w-350 px-5 md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-secondary">What guides us</span>
          <h2 className="mt-2 font-serif text-4xl font-semibold text-primary md:text-5xl">Principles made tangible.</h2>
          <p className="mt-5 text-[17px] leading-relaxed text-on-surface-variant">Good intentions only matter when they shape the object, its production, and what happens years after it leaves our hands.</p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value, index) => (
            <article key={value.title} className="group rounded-lg border border-outline/15 bg-surface-lowest p-7 transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-between"><span className="material-symbols-outlined text-3xl text-secondary">{value.icon}</span><span className="font-serif text-sm text-outline">0{index + 1}</span></div>
              <h3 className="mt-8 font-serif text-2xl font-semibold text-primary">{value.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{value.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-7 rounded-xl bg-surface-high p-8 md:flex-row md:items-center md:p-12">
          <div className="max-w-2xl"><span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary">Continue the story</span><h2 className="mt-2 font-serif text-3xl font-semibold text-primary">Choose an object whose story becomes part of yours.</h2></div>
          <Link href="/products" className="shrink-0 rounded bg-primary px-7 py-3.5 text-sm font-semibold text-on-primary">View all products</Link>
        </div>
      </div>
    </section>
  );
}
