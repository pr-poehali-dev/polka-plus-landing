import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';

// ─── Palette ──────────────────────────────────────────────────────────────────
export const WB       = '#CB11AB';
export const WB_DARK  = '#9A0080';
export const WB_LIGHT = '#F9ECF7';
export const WB_MID   = '#F0D6EC';

export const LEGO_IMG = 'https://cdn.poehali.dev/projects/48d0f348-e369-40e0-b696-33913aa2ef26/bucket/9a24b0fa-8ab2-4b6b-abf0-c3ca59a3b6e8.png';

// ─── useInView ────────────────────────────────────────────────────────────────
export const useInView = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
};

// ─── AnimatedCounter ─────────────────────────────────────────────────────────
export const AnimatedCounter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    const step = target / (2000 / 16);
    let cur = 0;
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString('ru')}{suffix}</span>;
};

// ─── FadeIn ───────────────────────────────────────────────────────────────────
export function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`
    }}>
      {children}
    </div>
  );
}

// ─── Tag ──────────────────────────────────────────────────────────────────────
export function Tag({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
      style={{ background: WB_LIGHT, color: WB }}>
      {label}
    </div>
  );
}

// ─── Accent ───────────────────────────────────────────────────────────────────
export function Accent({ children }: { children: React.ReactNode }) {
  return <span style={{ color: WB }}>{children}</span>;
}

// ─── FaqList ──────────────────────────────────────────────────────────────────
export function FaqList({ faq }: { faq: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {faq.map((item, i) => (
        <FadeIn key={i} delay={i * 0.04}>
          <div className="rounded-2xl border overflow-hidden transition-all duration-300"
            style={{ borderColor: open === i ? WB_MID : '#E5E7EB', background: open === i ? WB_LIGHT : 'white' }}>
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left">
              <span className="font-semibold text-gray-900 text-sm leading-snug">{item.q}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all"
                style={{ background: open === i ? WB : '#F3F4F6', transform: open === i ? 'rotate(45deg)' : 'rotate(0)' }}>
                <Icon name="Plus" size={14} className={open === i ? 'text-white' : 'text-gray-500'} />
              </div>
            </button>
            {open === i && (
              <div className="px-6 pb-5">
                <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        </FadeIn>
      ))}
    </div>
  );
}
