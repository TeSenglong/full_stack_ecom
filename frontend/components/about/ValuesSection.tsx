import Link from "next/link";

const VALUES = [
  {
    icon: "school",
    title: "University",
    text: "I am pursuing a bachelor's degree at Western University, where I am strengthening my knowledge, problem-solving abilities, and practical software development skills.",
  },
  {
    icon: "code",
    title: "Frontend Development",
    text: "I completed a short course at ISTAD focused on frontend development with React.js, where I learned to build responsive interfaces, reusable components, and interactive web applications.",
  },
  {
    icon: "dns",
    title: "Backend Development",
    text: "I completed a short course at ISTAD focused on Java and Spring Boot, where I learned to develop REST APIs, connect databases, implement security, and structure backend applications.",
  },
  {
    icon: "rocket_launch",
    title: "Career Goal",
    text: "Driven by a passion for technology, I continue learning, building projects, and strengthening my skills to become a professional software developer.",
  },
];

export default function ValuesSection() {
  return (
    <section id="values" className="py-24">
      <div className="mx-auto max-w-350 px-5 md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-secondary">My journey</span>
          <h2 className="mt-2 font-serif text-4xl font-semibold text-primary md:text-5xl">Education, skills, and ambition.</h2>
          <p className="mt-5 text-[17px] leading-relaxed text-on-surface-variant">My academic studies, technical courses, and hands-on projects are helping me grow into a well-rounded software developer.</p>
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
          <div className="max-w-2xl"><span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary">See my work</span><h2 className="mt-2 font-serif text-3xl font-semibold text-primary">Explore the full-stack project I built through this journey.</h2></div>
          <Link href="/products" className="shrink-0 rounded bg-primary px-7 py-3.5 text-sm font-semibold text-on-primary">Explore the project</Link>
        </div>
      </div>
    </section>
  );
}
