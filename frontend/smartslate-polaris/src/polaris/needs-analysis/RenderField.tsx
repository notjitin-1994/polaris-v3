// src/polaris/needs-analysis/RenderField.tsx
import type { NAField, NAResponseValue } from './types';

interface RenderFieldProps {
  field: NAField;
  value: NAResponseValue | undefined | null;
  onChange: (id: string, value: NAResponseValue | null) => void;
}

export default function RenderField({ field, value, onChange }: RenderFieldProps) {
  const common = (
    <label className="mb-2 block font-semibold">
      <span className="text-sm text-white/90">{field.label}</span>
      {field.required && <span className="text-red-500"> *</span>}
      {field.help && <div className="mt-1 text-xs text-white/60">{field.help}</div>}
    </label>
  );

  switch (field.type) {
    case 'text':
    case 'textarea': {
      const textField = field as any;
      return (
        <div className="mb-4">
          {common}
          {field.type === 'text' ? (
            <input
              className="input focus:border-primary-400 focus:ring-primary-400/20 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 focus:ring-1 focus:outline-none"
              placeholder={textField.placeholder}
              value={(value as string) ?? ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              maxLength={textField.maxLength}
            />
          ) : (
            <textarea
              className="input focus:border-primary-400 focus:ring-primary-400/20 min-h-[100px] w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 focus:ring-1 focus:outline-none"
              placeholder={textField.placeholder}
              value={(value as string) ?? ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              maxLength={textField.maxLength}
            />
          )}
        </div>
      );
    }

    case 'single_select': {
      const selectField = field as any;
      const opts = selectField.options || [];
      const listId = `${field.id}-datalist`;
      const current = (value as string) ?? '';
      return (
        <div className="mb-4">
          {common}
          <input
            list={listId}
            className="input focus:border-primary-400 focus:ring-primary-400/20 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 focus:ring-1 focus:outline-none"
            placeholder={current ? undefined : 'Select or type custom…'}
            value={current}
            onChange={(e) => onChange(field.id, e.target.value)}
          />
          <datalist id={listId}>
            {opts.map((o: string) => (
              <option key={o} value={o} />
            ))}
            <option value="Custom" />
          </datalist>
          <div className="mt-1 text-xs text-white/50">
            Choose from suggestions or type your own.
          </div>
        </div>
      );
    }

    case 'multi_select': {
      const multiField = field as any;
      const opts = multiField.options || [];
      const sel: string[] = Array.isArray(value) ? value : [];
      const selectedSet = new Set(sel);
      return (
        <div className="mb-4">
          {common}
          {/* Selected chips (includes custom values) */}
          {sel.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {sel.map((v) => (
                <span
                  key={`sel-${v}`}
                  className="border-primary-400 bg-primary-400/20 text-primary-200 inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
                >
                  {v}
                  <button
                    type="button"
                    aria-label={`Remove ${v}`}
                    className="text-primary-200/80 hover:text-primary-100"
                    onClick={() =>
                      onChange(
                        field.id,
                        sel.filter((s) => s !== v)
                      )
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Available options (hide already selected) */}
          <div className="flex flex-wrap gap-2">
            {opts
              .filter((o: string) => !selectedSet.has(o))
              .map((o: string) => (
                <button
                  type="button"
                  key={o}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-white/85 transition-all duration-200 hover:bg-white/10"
                  onClick={() => onChange(field.id, [...sel, o])}
                >
                  {o}
                </button>
              ))}
          </div>

          {/* Custom add input */}
          <div className="mt-2 flex items-center gap-2">
            <input
              className="focus:border-primary-400 focus:ring-primary-400/20 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 focus:ring-1 focus:outline-none"
              placeholder="Add a custom option"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  const val = input.value.trim();
                  if (val && !sel.includes(val)) {
                    onChange(field.id, [...sel, val]);
                  }
                  input.value = '';
                }
              }}
            />
            <span className="text-xs text-white/50">press Enter</span>
          </div>
        </div>
      );
    }

    case 'calendar_date': {
      const dateField = field as any;
      return (
        <div className="mb-4">
          {common}
          <input
            type="date"
            className="input focus:border-primary-400 focus:ring-primary-400/20 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:ring-1 focus:outline-none"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(field.id, e.target.value || null)}
            min={dateField.minDate}
            max={dateField.maxDate}
          />
        </div>
      );
    }

    case 'calendar_range': {
      const rangeField = field as any;
      const v = (value || {}) as { start?: string; end?: string };
      return (
        <div className="mb-4">
          {common}
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="input focus:border-primary-400 focus:ring-primary-400/20 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:ring-1 focus:outline-none"
              value={v.start ?? ''}
              onChange={(e) => onChange(field.id, { ...v, start: e.target.value })}
              min={rangeField.minDate}
              max={rangeField.maxDate}
            />
            <span className="text-white/60">to</span>
            <input
              type="date"
              className="input focus:border-primary-400 focus:ring-primary-400/20 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:ring-1 focus:outline-none"
              value={v.end ?? ''}
              onChange={(e) => onChange(field.id, { ...v, end: e.target.value })}
              min={rangeField.minDate}
              max={rangeField.maxDate}
            />
          </div>
        </div>
      );
    }

    case 'slider': {
      const sliderField = field as any;
      const { min = 0, max = 10, step = 1, unit } = sliderField;
      const num = typeof value === 'number' ? value : (sliderField.default ?? min);
      return (
        <div className="mb-6">
          {common}
          <div className="space-y-2">
            <input
              type="range"
              className="accent-primary-400 h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10"
              min={min}
              max={max}
              step={step}
              value={num}
              onChange={(e) => onChange(field.id, Number(e.target.value))}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">
                {min}
                {unit ? ` ${unit}` : ''}
              </span>
              <span className="text-primary-300 text-sm font-medium">
                {num}
                {unit ? ` ${unit}` : ''}
              </span>
              <span className="text-xs text-white/50">
                {max}
                {unit ? ` ${unit}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="focus:border-primary-400 focus:ring-primary-400/20 w-28 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 focus:ring-1 focus:outline-none"
                placeholder="Custom"
                value={typeof value === 'number' && (value < min || value > max) ? value : ''}
                onChange={(e) => {
                  const v = e.target.value === '' ? null : Number(e.target.value);
                  onChange(field.id, v);
                }}
              />
              <span className="text-xs text-white/50">custom value</span>
            </div>
          </div>
        </div>
      );
    }

    case 'number': {
      const numberField = field as any;
      const { min, max, step, unit } = numberField;
      return (
        <div className="mb-4">
          {common}
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="input focus:border-primary-400 focus:ring-primary-400/20 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:ring-1 focus:outline-none"
              min={min}
              max={max}
              step={step}
              value={(value as number) ?? ''}
              onChange={(e) =>
                onChange(field.id, e.target.value === '' ? null : Number(e.target.value))
              }
            />
            {unit && <span className="text-sm text-white/60">{unit}</span>}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
