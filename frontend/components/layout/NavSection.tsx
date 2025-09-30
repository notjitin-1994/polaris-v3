'use client';

import { memo, useState } from 'react';

export type NavItem =
  | string
  | {
      label: string;
      tagText?: string;
      tagTone?: 'preview' | 'soon' | 'info';
    };

export interface NavSectionProps {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
  onItemClick?: (item: NavItem) => void;
}

export const NavSection = memo(function NavSection({
  title,
  items,
  defaultOpen = false,
  onItemClick,
}: NavSectionProps) {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  return (
    <div className="select-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pressable font-heading flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-[#a7dadb] transition hover:bg-white/5"
        aria-expanded={open}
        aria-controls={`section-${title.replace(/\s+/g, '-')}`}
      >
        <span>{title}</span>
        <span
          className={`inline-block text-xs text-white/70 transition-transform ${open ? 'rotate-90' : ''}`}
        >
          ▶
        </span>
      </button>
      <div
        id={`section-${title.replace(/\s+/g, '-')}`}
        className={`${open ? 'block' : 'hidden'} mt-1 pl-2`}
      >
        <ul className="space-y-0.5">
          {items.map((item) => {
            const { label, tagText, tagTone } =
              typeof item === 'string'
                ? { label: item, tagText: undefined, tagTone: undefined }
                : item;
            return (
              <li key={label}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onItemClick?.(item);
                  }}
                  className="pressable flex items-center justify-between rounded-lg px-3 py-1.5 text-sm text-white/75 transition hover:bg-[#a7dadb]/5 hover:text-[#a7dadb] focus-visible:text-[#a7dadb] active:text-[#a7dadb]"
                >
                  <span className="truncate">{label}</span>
                  {tagText && (
                    <span
                      className={`ml-3 inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                        tagTone === 'preview'
                          ? 'border-[#7bc5c7]/30 bg-[#7bc5c7]/10 text-[#d0edf0]'
                          : 'border-white/10 bg-white/5 text-white/60'
                      }`}
                    >
                      {tagText}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
});
