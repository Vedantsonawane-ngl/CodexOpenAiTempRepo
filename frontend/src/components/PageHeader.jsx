export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-md md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <p className="font-geist text-[11px] font-bold uppercase tracking-[0.08em] text-primary">{eyebrow}</p> : null}
        <h3 className="text-2xl font-bold tracking-tight text-on-surface">{title}</h3>
        {description ? <p className="mt-xs max-w-3xl text-sm text-on-surface-variant">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-sm">{actions}</div> : null}
    </div>
  );
}
