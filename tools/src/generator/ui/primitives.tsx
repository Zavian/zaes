import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

const base =
  'inline-flex items-center justify-center gap-1.5 rounded border text-sm font-mono transition-colors cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600';
const variants = {
  primary: 'bg-emerald-700 dark:bg-emerald-700 border-emerald-700 dark:border-emerald-600 text-white hover:bg-emerald-800 dark:hover:bg-emerald-600',
  secondary:
    'bg-white dark:bg-[#20242D] border-gray-200 dark:border-[#2E333D] text-[#1A1A1A] dark:text-[#F3F4F6] hover:bg-emerald-50/60 dark:hover:bg-[#282C37]',
  ghost: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-[#1F222A]',
  danger:
    'bg-white dark:bg-[#20242D] border-gray-200 dark:border-[#2E333D] text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-900',
};
const sizes = { sm: 'px-2 py-1', md: 'px-3 py-1.5', icon: 'p-1.5' };

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  active?: boolean;
};
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', active, className, type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(base, variants[variant], sizes[size], active && 'ring-1 ring-emerald-600 dark:ring-emerald-400 !text-emerald-700 dark:!text-emerald-300', className)}
      {...rest}
    />
  );
});

const field =
  'w-full rounded border border-gray-200 dark:border-[#2E333D] bg-white dark:bg-[#111318] px-2.5 py-1.5 text-base text-[#1A1A1A] dark:text-[#F3F4F6] placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-600/40 transition-colors';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest },
  ref
) {
  return <input ref={ref} className={cx(field, className)} {...rest} />;
});

export const Select = ({ className, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cx(field, 'pr-7 cursor-pointer', className)} {...rest} />
);

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return <textarea ref={ref} className={cx(field, 'font-mono text-[15px] leading-relaxed resize-y', className)} {...rest} />;
  }
);

export const Label: React.FC<{ children: React.ReactNode; htmlFor?: string; hint?: string; className?: string }> = ({
  children,
  htmlFor,
  hint,
  className,
}) => (
  <label htmlFor={htmlFor} className={cx('block mb-1 text-[13px] font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400', className)}>
    {children}
    {hint && <span className="ml-2 normal-case tracking-normal font-normal text-gray-400 dark:text-gray-500">{hint}</span>}
  </label>
);

export const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; id?: string }> = ({
  checked,
  onChange,
  label,
  id,
}) => (
  <label className="inline-flex items-center gap-2 cursor-pointer text-base text-gray-600 dark:text-gray-300 select-none">
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative h-5 w-9 rounded-full border transition-colors shrink-0 cursor-pointer',
        checked ? 'bg-emerald-700 dark:bg-emerald-500 border-emerald-700 dark:border-emerald-500' : 'bg-gray-200 dark:bg-[#2E333D] border-gray-300 dark:border-[#3a4050]'
      )}
    >
      <span className={cx('absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full bg-white transition-transform', checked && 'translate-x-4')} />
    </button>
    {label}
  </label>
);

export const Panel: React.FC<{ title?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }> = ({
  title,
  actions,
  children,
  className,
}) => (
  <section className={cx('rounded border border-gray-200 dark:border-[#2E333D] bg-white dark:bg-[#181A20]', className)}>
    {(title || actions) && (
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-gray-200 dark:border-[#2E333D]">
        <h2 className="text-[13px] font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">{title}</h2>
        {actions}
      </div>
    )}
    {children}
  </section>
);

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}> = ({ open, onClose, title, children, footer, wide }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8 no-print" onMouseDown={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" aria-hidden />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className={cx(
          'relative w-full rounded border border-gray-200 dark:border-[#2E333D] bg-white dark:bg-[#181A20] shadow-xl outline-none',
          wide ? 'max-w-4xl' : 'max-w-xl'
        )}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-gray-200 dark:border-[#2E333D]">
          <h2 className="font-bold text-[#1A1A1A] dark:text-[#F3F4F6]">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="px-5 py-4 text-base text-gray-700 dark:text-gray-300">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 px-5 py-3 border-t border-gray-200 dark:border-[#2E333D]">{footer}</div>}
      </div>
    </div>
  );
};

export const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-[#3a4050] bg-gray-50 dark:bg-[#111318] text-[13px] font-mono text-gray-600 dark:text-gray-300">
    {children}
  </kbd>
);
