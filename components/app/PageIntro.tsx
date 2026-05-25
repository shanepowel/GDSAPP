/** Consistent page heading + supporting copy for scanability. */
export function PageIntro({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <header className={className}>
      <h2 className="font-display text-xl font-semibold text-text md:text-2xl">{title}</h2>
      {description && (
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-muted">{description}</p>
      )}
    </header>
  );
}
