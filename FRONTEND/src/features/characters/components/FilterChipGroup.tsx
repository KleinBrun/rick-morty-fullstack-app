import type { FilterChipProps, FilterGroupProps } from '../types/ui.types';

export function FilterChip({ active, label, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full min-w-0 whitespace-nowrap rounded-md border px-1.5 py-1 text-center text-[7px] font-medium leading-tight transition sm:px-2 sm:py-1 sm:text-[8px] lg:px-3 lg:py-1.5 lg:text-[10px]',
        active
          ? 'border-[#EEE4FF] bg-[#EEE4FF] text-[#673FAC]'
          : 'border-slate-200 bg-white text-slate-700 hover:border-[#EEE4FF] hover:bg-[#EEE4FF] hover:text-[#673FAC]',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

export function FilterGroup({ children, columns, title }: FilterGroupProps) {
  return (
    <div>
      <p className="mb-1 text-[9px] font-medium text-slate-500 lg:text-[11px]">{title}</p>
      <div className={["grid gap-1", columns].join(' ')}>{children}</div>
    </div>
  );
}
