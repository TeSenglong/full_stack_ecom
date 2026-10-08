/* eslint-disable @next/next/no-img-element */


export default function OurStory() {
  return (
    <section id="story" className="bg-surface-low py-24">
      <div className="mx-auto max-w-350 px-5 md:px-8 lg:px-12">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-secondary">Our beginning</span>
            <h2 className="mt-2 font-serif text-4xl font-semibold leading-tight text-primary md:text-5xl">Built from learning, curiosity, and a desire to create something real.</h2>
            <p className="mt-6 text-[17px] leading-relaxed text-on-surface-variant">MiniShop started as a personal project to turn what I was learning about software development into a complete, working e-commerce application. Instead of building only a frontend or a simple CRUD project, I wanted to understand how a real application works from the user interface all the way to the database.</p>
            <p className="mt-4 text-[15px] leading-relaxed text-on-surface-variant">I built the frontend with Next.js and TypeScript, developed the backend with Java and Spring Boot, and use PostgreSQL hosted on Supabase for data storage. Along the way, I have been implementing authentication, product and category management, image storage, pagination, security, and an admin dashboard.</p>
            <p className="mt-4 text-[15px] leading-relaxed text-on-surface-variant">MiniShop continues to evolve as I learn. Every new feature gives me an opportunity to improve the architecture, write better code, and gain practical experience building a modern full-stack application.</p>
          </div>
          <div className="lg:col-span-7">
            <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-surface-container shadow-lg">
              <img src="https://lzfudmcajnsccibezqgb.supabase.co/storage/v1/object/public/image/Minimal%20Full-Stack%20Architecture%20Diagram.png" alt="Ceramicist forming a vessel in the workshop" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}
