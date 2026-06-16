export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-hero relative overflow-hidden border-b border-white/5">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-faint opacity-40"
        style={{ backgroundSize: "44px 44px", maskImage: "radial-gradient(70% 70% at 50% 0%, black, transparent)" }}
        aria-hidden
      />
      <div className="container-x relative py-16 text-center sm:py-20">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold sm:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-mist-300">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
