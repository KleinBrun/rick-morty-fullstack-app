type EmptyStateProps = {
  title: string;
  description: string;
  variant?: 'compact' | 'hero';
};

export function EmptyState({ title, description, variant = 'compact' }: EmptyStateProps) {
  if (variant === 'hero') {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-[28px] border border-[#E7DBFF] bg-[linear-gradient(135deg,#FAF7FF_0%,#F4EEFF_100%)] p-8 text-center shadow-[0_18px_45px_rgba(103,63,172,0.10)] lg:min-h-[620px] lg:p-12">
        <div className="max-w-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-white text-[#8757D1] shadow-sm ring-1 ring-[#E7DBFF] lg:h-24 lg:w-24">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 4v16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M4 12h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" opacity="0.35" />
            </svg>
          </div>

          <h3 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">{title}</h3>
          <p className="mx-auto mt-3 max-w-md text-base leading-7 text-slate-600 lg:text-lg">
            {description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#FFFFFF_0%,#FAF7FF_100%)] p-7 text-center shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3ECFF] text-[#8757D1] ring-1 ring-[#E7DBFF]">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="5.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M20 20l-3.8-3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>

      <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}
