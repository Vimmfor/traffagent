import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Menu, Sparkles, X } from "lucide-react";

/**
 * TraffAgent — App.tsx (light)
 * - Убран магнитный курсор (минус постоянный RAF)
 * - Маркиза и искры останавливаются вне вьюпорта и в скрытой вкладке
 * - Остальные анимации и UI без изменений
 */

/* ===== интеграции (опционально) ===== */
const LEAD_WEBHOOK = "";
const TG_BOT_TOKEN = "";
const TG_CHAT_ID = "";
declare global {
  interface Window {
    __TG_TOKEN__?: string;
    __TG_CHAT__?: string;
  }
}
const BOT_TOKEN =
  (typeof window !== "undefined" && window.__TG_TOKEN__) || TG_BOT_TOKEN;
const CHAT_ID =
  (typeof window !== "undefined" && window.__TG_CHAT__) || TG_CHAT_ID;

/* ===== анимации ===== */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

/* ===== SparklesFX — лёгкие «искорки» на canvas (с авто-паузой) ===== */
function SparklesFX({ count = 60 }: { count?: number }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReduced = useReducedMotion();
  const [active, setActive] = useState(true); // управляем рендером

  useEffect(() => {
    if (prefersReduced) return;

    // Пауза при скрытой вкладке
    const onVis = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", onVis);

    // Пауза, если секция вне экрана
    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window && wrapRef.current) {
      io = new IntersectionObserver(
        (ents) => {
          const e = ents[0];
          setActive(e.isIntersecting && !document.hidden);
        },
        { rootMargin: "0px 0px 0px 0px", threshold: 0 }
      );
      io.observe(wrapRef.current);
    }

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      io?.disconnect();
    };
  }, [prefersReduced]);

  useEffect(() => {
    if (prefersReduced) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    const particles = Array.from({ length: count }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.6,
      a: 0.3 + Math.random() * 0.6,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
    }));

    let raf = 0;
    const loop = () => {
      if (!active) {
        raf = requestAnimationFrame(loop);
        return;
      }
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grad.addColorStop(0, `rgba(255,255,255,${p.a})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [count, prefersReduced, active]);

  return (
    <div ref={wrapRef} className="absolute inset-0 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

/* ===== утилиты ===== */
function Section({
  id,
  children,
  className = "",
  bg = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  bg?: string;
}) {
  return (
    <section
      id={id}
      className={`${bg} relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </section>
  );
}
function Kicker({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 ${className}`}
    >
      <Sparkles className="h-3.5 w-3.5" /> {children}
    </span>
  );
}
function H2({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`mt-2 text-[22px] sm:text-2xl md:text-4xl font-semibold leading-tight tracking-tight ${className}`}
    >
      {children}
    </h2>
  );
}

/* ===== бегущая строка (яркая) — с авто-паузой вне вьюпорта/вкладки ===== */
function ContinuousMarquee({
  items,
  speed = 65,
  gap = 96,
}: {
  items: string[];
  speed?: number;
  gap?: number;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);
  const [width, setWidth] = useState(0);
  const prefersReduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);

  // наблюдаем ширину
  useEffect(() => {
    const recalc = () => {
      if (stripRef.current)
        setWidth(stripRef.current.getBoundingClientRect().width);
    };
    recalc();
    const RO = (window as any).ResizeObserver;
    let ro: any;
    if (RO && stripRef.current) {
      ro = new RO(recalc);
      ro.observe(stripRef.current);
    }
    const r = () => recalc();
    window.addEventListener("resize", r);
    return () => {
      if (ro && stripRef.current) ro.disconnect();
      window.removeEventListener("resize", r);
    };
  }, []);

  // авто-пауза при скрытой вкладке / вне экрана
  useEffect(() => {
    const vis = () => setPaused(document.hidden || !inView);
    document.addEventListener("visibilitychange", vis);
    return () => document.removeEventListener("visibilitychange", vis);
  }, [inView]);

  useEffect(() => {
    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window && hostRef.current) {
      io = new IntersectionObserver(
        (ents) => {
          const e = ents[0];
          setInView(e.isIntersecting);
          setPaused(document.hidden || !e.isIntersecting);
        },
        { rootMargin: "0px", threshold: 0 }
      );
      io.observe(hostRef.current);
    }
    return () => io?.disconnect();
  }, []);

  // анимация
  useEffect(() => {
    if (prefersReduced) return;
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = now - prev;
      prev = now;
      if (!paused) {
        setOffset((o) => (width <= 0 ? 0 : (o + (speed * dt) / 1000) % width));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed, width, paused, prefersReduced]);

  const strip = (k: string, x: number) => (
    <div
      key={k}
      ref={k === "a" ? stripRef : null}
      className="absolute left-0 top-0 inline-flex items-center font-semibold uppercase tracking-wide"
      style={{
        transform: `translateX(${x}px)`,
        gap: `${gap}px`,
        whiteSpace: "nowrap",
        padding: "12px 0",
      }}
    >
      {items.map((t, i) => (
        <React.Fragment key={`${k}-${i}`}>
          <span className="marquee-chip">
            <span className="marquee-dot" aria-hidden />
            <span className="marquee-text">{t}</span>
          </span>
          {i !== items.length - 1 && (
            <span aria-hidden="true" className="mx-2 md:mx-4 text-zinc-400">
              •
            </span>
          )}
        </React.Fragment>
      ))}
      <span aria-hidden="true" style={{ display: "inline-block", width: gap }} />
    </div>
  );

  const x1 = -offset,
    x2 = width - offset;

  return (
    <div
      ref={hostRef}
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(document.hidden || !inView)}
    >
      {/* светящаяся подложка */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "linear-gradient(180deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))",
          boxShadow:
            "inset 0 -1px 0 rgba(24,24,27,.08), inset 0 1px 0 rgba(24,24,27,.08)",
        }}
      />
      <div className="relative border-y border-zinc-200/70 bg-zinc-50/80">
        <style>{`
          .marquee-chip{
            display:inline-flex;align-items:center;gap:.75rem;
            padding:.55rem .95rem;border-radius:9999px;
            background:rgba(255,255,255,0.9);
            border:1px solid rgba(24,24,27,.08);
            box-shadow:0 6px 24px -10px rgba(168,85,247,.35), 0 2px 10px -6px rgba(99,102,241,.35);
            backdrop-filter:saturate(130%) blur(2px);
          }
          .marquee-dot{
            width:.5rem;height:.5rem;border-radius:9999px;
            background:linear-gradient(90deg,#6366f1,#a855f7,#ec4899);
            box-shadow:0 0 12px rgba(99,102,241,.6);
          }
          .marquee-text{
            background:linear-gradient(90deg,#111827,#111827 40%,#6d28d9 60%,#0ea5e9 100%);
            -webkit-background-clip:text;background-clip:text;color:transparent;
            background-size:200% 100%;
            animation:marqueeHue 5.5s ease-in-out infinite;
            letter-spacing:.04em;
          }
          @keyframes marqueeHue{
            0%{background-position:0% 50%}
            50%{background-position:100% 50%}
            100%{background-position:0% 50%}
          }
          @media (max-width: 640px){
            .marquee-chip{padding:.5rem .75rem}
          }
        `}</style>
        <div className="relative h-[64px] sm:h-[72px] px-2 sm:px-4">
          {strip("a", x1)}
          {strip("b", x2)}
        </div>
      </div>
    </div>
  );
}

/* ===== Header ===== */
function Header({ onQuiz }: { onQuiz: () => void }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const handler = (e: any) => {
      const a = (e.target as HTMLElement).closest(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href");
      if (id && id.startsWith("#") && id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          (el as HTMLElement).scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          setOpen(false);
        }
      }
    };
    const nav = document.getElementById("main-nav");
    if (nav) nav.addEventListener("click", handler, { passive: false } as any);
    return () => nav && nav.removeEventListener("click", handler as any);
  }, []);
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/70 backdrop-blur">
      <nav
        id="main-nav"
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between"
      >
        <a href="#home" className="text-sm font-semibold tracking-tight">
          TraffAgent
        </a>
        <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          <a href="#services" className="hover:text-zinc-100">Услуги</a>
          <a href="#inside" className="hover:text-zinc-100">Внутри</a>
          <a href="#cases" className="hover:text-zinc-100">Кейсы</a>
          <a href="#pricing" className="hover:text-zinc-100">Тарифы</a>
          <a href="#faq" className="hover:text-zinc-100">FAQ</a>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onQuiz}
            className="group hidden sm:inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-3 py-2 text-sm font-semibold text-white shadow hover:shadow-lg transition-transform hover:scale-[1.02]"
          >
            Консультация <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Открыть меню"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="md:hidden border-t border-white/10 bg-zinc-950/95 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 grid gap-2 text-base">
            <a href="#services" className="py-3">Услуги</a>
            <a href="#inside" className="py-3">Внутри</a>
            <a href="#cases" className="py-3">Кейсы</a>
            <a href="#pricing" className="py-3">Тарифы</a>
            <a href="#faq" className="py-3">FAQ</a>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onQuiz();
              }}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-4 py-3 font-semibold text-white"
            >
              Запустить трафик
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ===== helpers для HERO ===== */
function useMouseTilt(strength = 10) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<{ transform: string }>({
    transform: "rotateX(0deg) rotateY(0deg) translateZ(0)",
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handle = (e: MouseEvent | TouchEvent) => {
      const rect = el.getBoundingClientRect();
      const px =
        (("touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX) -
          rect.left) /
        rect.width;
      const py =
        (("touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY) -
          rect.top) /
        rect.height;
      const rx = (0.5 - py) * strength;
      const ry = (px - 0.5) * strength;
      setStyle({
        transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`,
      });
    };
    const leave = () =>
      setStyle({
        transform:
          "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)",
      });

    el.addEventListener("mousemove", handle, { passive: true });
    el.addEventListener("touchmove", handle, { passive: true });
    el.addEventListener("mouseleave", leave);
    el.addEventListener("touchend", leave);
    return () => {
      el.removeEventListener("mousemove", handle as any);
      el.removeEventListener("touchmove", handle as any);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("touchend", leave);
    };
  }, [strength]);

  return { ref, style };
}

function MagneticButton({
  children,
  className = "",
  onClick,
  href,
  target,
  rel,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
}) {
  // лёгкий «магнит» внутри самой кнопки (без глобального курсора)
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const [t, setT] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const enter = () => setT({ x: 0, y: 0 });
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      setT({ x: x * 0.12, y: y * 0.12 });
    };
    const leave = () => setT({ x: 0, y: 0 });

    el.addEventListener("mouseenter", enter);
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, []);

  const common = {
    ref,
    style: { transform: `translate3d(${t.x}px, ${t.y}px, 0)` },
    className: `will-change-transform transition-transform duration-150 ${className}`,
  } as any;

  return href ? (
    <a {...common} href={href} target={target} rel={rel}>
      {children}
    </a>
  ) : (
    <button {...common} type="button" onClick={onClick}>
      {children}
    </button>
  );
}

/* ===== HERO ===== */
function Hero({ onQuiz }: { onQuiz: () => void }) {
  const prefersReduced = useReducedMotion();
  const marqueeItems = [
    "Финтех, порнуха, чернуха, вейпы — мы не боимся запретов. Здесь реклама живёт дольше любого модератора.",
  ];
  const tilt = useMouseTilt(8);

  const gridSvg = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>
      <path d='M32 0H0v32' fill='none' stroke='rgba(24,24,27,.08)'/>
    </svg>
  `);
  const noisePng =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWP4/58BCgAHxgK1l9a4VQAAAABJRU5ErkJggg==";

  const [sy, setSy] = useState(0);
  useEffect(() => {
    if (prefersReduced) return;
    const onScroll = () => setSy(window.scrollY || 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [prefersReduced]);
  const parallaxY = Math.min(sy * 0.08, 80);

  return (
    <Section
      id="home"
      className="relative overflow-hidden pt-16 pb-20 sm:pt-20 sm:pb-24"
      bg="bg-white text-zinc-900"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,${gridSvg}"), url(${noisePng})`,
          backgroundSize: "32px 32px, auto",
          backgroundBlendMode: "normal, soft-light",
          opacity: 0.9,
        }}
      />
      {!prefersReduced && <SparklesFX count={70} />}

      {!prefersReduced && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,.35) 0%, rgba(244,63,94,.15) 45%, rgba(255,255,255,0) 70%)",
              transform: `translateY(${parallaxY}px)`,
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute top-10 -right-24 h-[420px] w-[420px] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 50%, rgba(168,85,247,.30) 0%, rgba(34,197,94,.12) 50%, rgba(255,255,255,0) 70%)",
              transform: `translateY(${parallaxY * 0.7}px)`,
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
          />
        </>
      )}

      <style>{`
        .hero-gradient-text{
          position:relative;
          background:linear-gradient(90deg,#6366f1,#a855f7,#ec4899,#22c55e,#06b6d4);
          background-size:200% 200%;
          -webkit-background-clip:text;background-clip:text;color:transparent;
          animation:heroGradient 7s ease-in-out infinite;
        }
        .hero-gradient-text::after{content:"";position:absolute;inset:0;background:linear-gradient(120deg,transparent 0%,rgba(255,255,255,.6) 15%,transparent 30%);transform:translateX(-200%);pointer-events:none;border-radius:.5rem}
        .hero-gradient-text:hover::after{animation:shine 1.4s ease-out 1}
        @keyframes heroGradient{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes shine{0%{transform:translateX(-200%)}100%{transform:translateX(200%)}}
        .float-chip{animation:float 6s ease-in-out infinite}
        @keyframes float{0%{transform:translateY(0)}50%{transform:translateY(-8px)}100%{transform:translateY(0)}}
      `}</style>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center"
      >
        <motion.div variants={item} className="lg:col-span-7">
          <Kicker>Performance-маркетинг под KPI</Kicker>
          <h1 className="mt-3 text-[44px] leading-[1.06] sm:text-7xl sm:leading-[1.06] md:text-[88px] md:leading-[1.04] font-extrabold tracking-tight">
            <span className="hero-gradient-text">Performance трафик под KPI</span>
          </h1>
          <p className="mt-5 max-w-2xl text-zinc-600 text-base sm:text-lg">
            Нам похуй на правила! Запускаем и масштабируем платный трафик под окупаемость и LTV.
            Креативы, закупка, аналитика и автоматизация.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {["Meta", "YouTube", "TikTok", "Google", "Telegram", "Twitter / X"].map(
              (t, i) => (
                <span
                  key={t}
                  className="float-chip inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-1.5 text-xs text-zinc-700 shadow-sm"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />{" "}
                  {t}
                </span>
              )
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3">
            <MagneticButton
              onClick={onQuiz}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-6 py-4 text-base sm:text-sm font-semibold text-white shadow-xl hover:shadow-2xl hover:scale-[1.02]"
            >
              Запустить трафик <ArrowRight className="ml-2 h-5 w-5" />
            </MagneticButton>
            <MagneticButton
              href="https://t.me/traffagent"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 bg-white px-6 py-4 text-base sm:text-sm font-semibold hover:bg-zinc-100 hover:scale-[1.01]"
            >
              Похуй, делаем!
            </MagneticButton>
          </div>

          <div className="mt-8 hidden sm:flex items-center gap-2 text-xs text-zinc-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-300" />
            Листайте вниз — там кейсы и тарифы
          </div>
        </motion.div>

        <div className="lg:col-span-5">
          <motion.div className="relative rounded-3xl border border-zinc-200/70 bg-white/75 backdrop-blur-xl p-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,.15)] will-change-transform">
            <TiltCard />
          </motion.div>
        </div>

        {/* Яркая бегущая строка с твоим текстом */}
        <div className="lg:col-span-12">
          <ContinuousMarquee items={marqueeItems} speed={65} gap={96} />
        </div>
      </motion.div>
    </Section>
  );
}

function TiltCard() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-zinc-700">Спринт: 14 дней</div>
        <span className="text-xs rounded-full px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200">
          KPI-driven
        </span>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-zinc-600">
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-indigo-500" /> 6–12 креативов на
          итерацию
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-indigo-500" /> мультиканальный баинг
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-indigo-500" /> автоматизация и правила
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-indigo-500" /> сквозная аналитика
        </li>
      </ul>
      <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
        <div className="rounded-xl border border-zinc-200 bg-white p-3 text-center">
          <div className="text-zinc-900 font-semibold">3.7x</div>
          <div className="text-zinc-500 mt-0.5">ROAS avg</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 text-center">
          <div className="text-zinc-900 font-semibold">120k+</div>
          <div className="text-zinc-500 mt-0.5">лидов/год</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 text-center">
          <div className="text-zinc-900 font-semibold">18</div>
          <div className="text-zinc-500 mt-0.5">источников</div>
        </div>
      </div>
    </>
  );
}

/* ===== Services ===== */
function Services({ onQuiz }: { onQuiz: () => void }) {
  const groups = [
    {
      title: "Медиабаинг + Комплаенс",
      desc: "Meta, Google, TikTok, альтернативы. Anti-ban, прогрев, резервы.",
      bullets: ["Гипотезы и тесты", "Масштабирование", "Кейсы по вайт/грей"],
    },
    {
      title: "Креативы + Продакшн",
      desc: "UGC, статик, видео. Быстрые пачки и итерации.",
      bullets: ["Сториборды", "Сплиты и вариации", "CTR/CR рост"],
    },
    {
      title: "Воронки + Автоматизация",
      desc: "Квизы, чат-боты, CRM. Правила и скрипты для оптимизаций.",
      bullets: ["Квизы и LP", "Боты и ретеншн", "Правила/скрипты"],
    },
    {
      title: "Аналитика + Отчетность",
      desc: "Серверный трекинг, событийная модель, сводка в BI.",
      bullets: ["Сквозная аналитика", "Дашборды", "KPI weekly"],
    },
  ];
  return (
    <Section id="services" className="py-16" bg="bg-zinc-950 text-zinc-100">
      <Kicker>Что мы делаем</Kicker>
      <H2>Услуги</H2>
      <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-sm items-stretch">
        {groups.map((g, i) => (
          <li
            key={i}
            className="group h-full flex flex-col rounded-2xl border border-white/10 p-5 bg-gradient-to-b from-white/5 to-transparent transition-all hover:-translate-y-0.5 hover:border-white/20"
          >
            <div className="h-1 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 mb-3 opacity-90 group-hover:opacity-100" />
            <div className="flex-1">
              <div className="font-medium text-base sm:text-[15px]">
                {g.title}
              </div>
              <p className="mt-1 text-zinc-400">{g.desc}</p>
              <ul className="mt-3 space-y-1 text-[12px] sm:text-xs text-zinc-400">
                {g.bullets.map((b, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-zinc-300" /> {b}
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={onQuiz}
              className="mt-auto inline-flex items-center justify-center rounded-xl bg-white text-black px-4 py-2 text-sm font-medium w-full hover:bg-zinc-100 transition-colors"
            >
              Консультация
            </button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ===== Inside ===== */
function Inside() {
  const steps: [string, string][] = [
    ["Discovery", "Погружаемся в продукт, аудиторию и цели. KPI и рамки."],
    ["Стратегия", "Каналы, воронки, креативы, бюджет по спринтам."],
    ["Продакшн", "Креативы, лендинги/квизы, трекинг и CRM."],
    ["Запуск", "Закупка трафика, быстрые итерации, анти-бан."],
    ["Рост", "Оптимизация по LTV/ROAS, автоматизация, масштаб."],
  ];
  return (
    <Section id="inside" className="py-16" bg="bg-white text-zinc-900">
      <Kicker>Как это устроено</Kicker>
      <H2>Внутри TraffAgent</H2>
      <ol className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
        {steps.map(([t, d], i) => (
          <li
            key={i}
            className="rounded-2xl border border-zinc-200 p-5 bg-white/80 backdrop-blur hover:shadow-sm transition-shadow"
          >
            <div className="text-sm sm:text-[15px] font-medium">
              {String(i + 1).padStart(2, "0")}. {t}
            </div>
            <p className="mt-1 text-sm text-zinc-600">{d}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ===== Cases ===== */
function Cases() {
  const list: [string, string, string][] = [
    ["FinTech SaaS", "+212% MRR", "Google + LinkedIn + контент"],
    ["eCom здоровье", "ROAS 4.1", "TikTok UGC + квиз"],
    ["EdTech mobile", "CPI -37%", "Meta + пачки креативов"],
  ];
  return (
    <Section id="cases" className="py-16" bg="bg-zinc-950 text-zinc-100">
      <Kicker>Партнеры</Kicker>
      <H2>Кейсы</H2>
      <ul className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
        {list.map(([name, res, desc], i) => (
          <li
            key={i}
            className="rounded-2xl border border-white/10 p-5 hover:-translate-y-0.5 hover:border-white/20 transition-all"
          >
            <div className="flex items-baseline justify-between">
              <h3 className="font-medium">{name}</h3>
              <span className="text-xs font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 text-black rounded-full px-2 py-0.5">
                {res}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-300">{desc}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ===== Pricing ===== */
function Pricing({ onQuiz }: { onQuiz: () => void }) {
  const plans = [
    {
      name: "Старт",
      price: "от $1k",
      desc: "Для тестов и первых продаж",
      features: ["Стратегия", "3-5 подходов", "1-2 канала", "Еженед. отчет"],
      highlight: false,
    },
    {
      name: "Рост",
      price: "% от спенда + $5k",
      desc: "Для стабильного масштабирования",
      features: [
        "Пачки креативов",
        "Мультиканальный баинг",
        "Сквозная аналитика",
        "Автоматизация",
      ],
      highlight: true,
    },
    {
      name: "Скейл",
      price: "кастом",
      desc: "Под высокие бюджеты и KPI",
      features: [
        "Кастомная команда",
        "R&D и анти-бан",
        "Серверный трекинг",
        "SLA по KPI",
      ],
      highlight: false,
    },
  ];
  return (
    <Section id="pricing" className="py-16" bg="bg-white text-zinc-900">
      <Kicker>Прозрачные условия</Kicker>
      <H2 className="text-black">Тарифы</H2>
      <ul className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {plans.map((p, i) => (
          <li
            key={i}
            className={`group h-full flex flex-col rounded-2xl border p-6 bg-white/80 backdrop-blur ${
              p.highlight ? "border-zinc-300" : "border-zinc-200"
            } transition-all hover:-translate-y-0.5 hover:shadow-md`}
          >
            {p.highlight && (
              <span className="mb-3 inline-block rounded-full border border-zinc-300 px-2 py-0.5 text-xs bg-gradient-to-r from-indigo-100 to-fuchsia-100">
                Популярный
              </span>
            )}
            <div className="text-lg font-semibold">{p.name}</div>
            <div className="mt-1 text-2xl font-bold">{p.price}</div>
            <p className="mt-1 text-sm text-zinc-600">{p.desc}</p>
            <ul className="mt-4 space-y-1 text-sm text-zinc-600">
              {p.features.map((f, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-500" /> {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onQuiz}
              className="mt-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-4 py-3 text-sm font-medium text-white w-full shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02]"
            >
              Берем
            </button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ===== FAQ ===== */
function FAQ() {
  const qa: [string, string][] = [
    ["С какими вертикалями работаете?", "E-com, edtech, подписки, mobile, SaaS, финтех."],
    ["Когда ждать результат?", "Первые инсайты через 7–14 дней спринта, масштаб 1–2 месяца."],
    ["Как считаете атрибуцию?", "Серверный трекинг, событийная модель, сводка в BI."],
  ];
  return (
    <Section id="faq" className="py-16" bg="bg-zinc-950 text-zinc-100">
      <Kicker>Вопросы</Kicker>
      <H2>FAQ</H2>
      <ul className="mt-8 divide-y divide-white/10 rounded-2xl border border-white/10">
        {qa.map(([q, a], i) => (
          <li key={i} className="p-5">
            <div className="text-sm font-medium">{q}</div>
            <p className="mt-1 text-sm text-zinc-300">{a}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ===== Footer ===== */
function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 bg-zinc-950 text-zinc-400">
      <Section id="footer">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="text-sm font-semibold text-zinc-100">TraffAgent</div>
          <p className="text-xs">
            (c) {new Date().getFullYear()} TraffAgent. Все права защищены.
          </p>
        </div>
      </Section>
    </footer>
  );
}

/* ===== Квиз ===== */
function QuizModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  async function sendLead(payload: any) {
    try {
      const text = [
        "Новая заявка TraffAgent",
        `Бюджет: ${payload.budget || "-"}`,
        `Ниша: ${payload.niche || "-"}`,
        `GEO: ${payload.geo || "-"}`,
        `UA: ${navigator.userAgent}`,
        `Time: ${new Date().toISOString()}`,
      ].join("\n");
      if (LEAD_WEBHOOK) {
        await fetch(LEAD_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, answers: payload }),
          keepalive: true,
        });
        return;
      }
      if (BOT_TOKEN && CHAT_ID) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: CHAT_ID, text }),
          keepalive: true,
        });
      }
    } catch {}
  }
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ budget: "", niche: "", geo: "" });
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (!open) {
      setStep(0);
      setAnswers({ budget: "", niche: "", geo: "" });
    }
  }, [open]);

  const questions = [
    { key: "budget", text: "Какой у вас бюджет на месяц?", options: ["до $1k", "$1k–$5k", "$5k–$20k", "$20k+"] },
    { key: "niche",  text: "Какая ниша/продукт?",         options: ["E-com", "SaaS", "Mobile", "Инфо", "Финтех", "Другое"] },
    { key: "geo",    text: "Целевые GEO/рынки?",          options: ["EU", "US/CA", "MENA", "LatAm", "SEA", "Другое"] },
  ] as const;

  if (!open) return null;

  const tgLink = "https://t.me/traffagent";
  const summaryText = `Заявка TraffAgent — бюджет: ${answers.budget}; ниша: ${answers.niche}; GEO: ${answers.geo}`;

  const choose = async (opt: string) => {
    if (step < questions.length) {
      const key = questions[step].key as keyof typeof answers;
      const nextAnswers = { ...answers, [key]: opt };
      setAnswers(nextAnswers);
      const lastIndex = questions.length - 1;
      if (step < lastIndex) setStep(step + 1);
      else {
        await sendLead(nextAnswers);
        try {
          window.open(tgLink, "_blank", "noopener");
        } catch {}
        setStep(step + 1);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-[101] w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white text-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <div className="text-sm font-semibold">Мини-квиз</div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <div>
          {step < questions.length && (
            <div className="px-5 py-4">
              <div className="text-sm font-medium">{questions[step].text}</div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {questions[step].options.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => choose(opt)}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-left active:scale-[.99]"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === questions.length && (
            <div className="px-5 py-5 space-y-4">
              <div className="text-sm font-medium">Готово! Мы открыли Telegram.</div>
              <p className="text-sm text-zinc-600">
                Если Telegram не открылся — нажмите кнопку ниже. Текст с ответами
                можно скопировать вручную.
              </p>
              <textarea
                ref={textRef}
                value={summaryText}
                readOnly
                className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm text-zinc-700"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={tgLink}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center justify-center rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm font-semibold w-full sm:w-auto"
                >
                  Перейти в Telegram
                </a>
              </div>
            </div>
          )}
        </div>
        <div className="px-5 pb-5 pt-2 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            Шаг {Math.min(step + 1, questions.length)} из {questions.length}
          </div>
          {step > 0 && step <= questions.length - 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
            >
              Назад
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== Корень ===== */
function TraffAgentLanding() {
  const [quizOpen, setQuizOpen] = useState(false);
  useEffect(() => {
    const defs: any = { Header, Hero, Services, Inside, Cases, Pricing, FAQ, Footer };
    Object.entries(defs).forEach(([name, ref]) =>
      console.assert(typeof ref === "function", `${name} should be defined`)
    );
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-200">
      <Header onQuiz={() => setQuizOpen(true)} />
      <main>
        <Hero onQuiz={() => setQuizOpen(true)} />
        <Services onQuiz={() => setQuizOpen(true)} />
        <Inside />
        <Cases />
        <Pricing onQuiz={() => setQuizOpen(true)} />
        <FAQ />
      </main>
      <Footer />
      {/* мобильная CTA */}
      <div className="fixed bottom-3 inset-x-3 sm:hidden z-30">
        <button
          type="button"
          onClick={() => setQuizOpen(true)}
          className="flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 text-white px-4 py-3 text-base font-semibold shadow-lg shadow-black/30 w-full"
        >
          Берем — обсудить проект
        </button>
      </div>
      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} />
    </div>
  );
}

export default function App() {
  return <TraffAgentLanding />;
}
