import ProgressiveImage from "@/components/products/ProgressiveImage";

const DASHBOARD_FEATURES = [
  {
    icon: "dashboard",
    title: "Dashboard Overview",
    text: "The admin dashboard presents the store's key information in one place, making daily activity easier to understand and manage.",
    imageUrl:
      "https://lzfudmcajnsccibezqgb.supabase.co/storage/v1/object/public/image/dashboard3.png",
  },
  {
    icon: "inventory_2",
    title: "Catalog Management",
    text: "Administrators can create, update, and remove products and categories while keeping prices, images, and stock information accurate.",
    imageUrl:
      "https://lzfudmcajnsccibezqgb.supabase.co/storage/v1/object/public/image/dashboard1.png",
  },
  {
    icon: "manage_accounts",
    title: "Orders and Customers",
    text: "The dashboard provides tools for reviewing orders, updating order status, and managing customer roles and account access.",
    imageUrl:
      "https://lzfudmcajnsccibezqgb.supabase.co/storage/v1/object/public/image/dashboard2.png",
  },
];

export default function DashboardSection() {
  return (
    <section id="dashboard" className="py-24">
      <div className="mx-auto max-w-350 px-5 md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-secondary">
            Admin experience
          </span>
          <h2 className="mt-2 font-serif text-4xl font-semibold text-primary md:text-5xl">
            A focused dashboard for store management.
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-on-surface-variant">
            The protected admin area brings catalog, order, and customer
            management together in one clear workspace.
          </p>
        </div>

        <div data-aos="fade-up"
          data-aos-once="false"
          data-aos-mirror="true"
          suppressHydrationWarning className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DASHBOARD_FEATURES.map((feature, index) => (
            <article
              key={feature.title}
              className="group overflow-hidden rounded-xl border border-outline/15 bg-surface-lowest transition-transform hover:-translate-y-1 hover:shadow-lg"
            >
              {feature.imageUrl ? (
                <ProgressiveImage
                  src={feature.imageUrl}
                  alt="MOHAORI admin dashboard overview"
                // className="aspect-16/10 w-full"
                />
              ) : (
                <div className="flex aspect-16/10 items-center justify-center bg-surface-low">
                  <span className="material-symbols-outlined text-6xl text-secondary">
                    {feature.icon}
                  </span>
                </div>
              )}

              <div className="p-7">
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-3xl text-secondary">
                    {feature.icon}
                  </span>
                  <span className="font-serif text-sm text-outline">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 font-serif text-2xl font-semibold text-primary">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                  {feature.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
