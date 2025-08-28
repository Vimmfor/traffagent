import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Menu, Sparkles, X } from "lucide-react";

// ====== (опц.) внешние ссылки — сейчас нигде не показываем ======
const GITHUB_URL = "https://github.com/vimmfor/traffagent";
const VERCEL_URL = "https://vercel.com/dashboard?project=traffagent";

// ====== Отправка лида (опционально — webhook или Telegram Bot API) ======
const LEAD_WEBHOOK = "";
const TG_BOT_TOKEN = "";
const TG_CHAT_ID = "";

// ====== Pixel helper ======
declare global { interface Window { fbq?: (...args: any[]) => void } }
const fbqTrack = (event: string, params?: Record<string, any>) => {
  try { window.fbq && window.fbq("track", event, params || {}); } catch {}
};

// ====== Анимации ======
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

// ====== Примитивы UI ======
type SectionProps = { id?: string; children: React.ReactNode; className?: string; bg?: string };
const Section: React.FC<SectionProps> = ({ id, children, className = "", bg = "" }) => (
  <section id={id} className={`${bg} mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</section>
);

const Kicker: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span className={`inline-flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 ${className}`}>
    <Sparkles className="h-3.5 w-3.5" /> {children}
  </span>
);

const H2: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <h2 className={`mt-2 text-[22px] sm:text-2xl md:text-4xl font-semibold leading-tight tracking-tight ${className}`}>{children}</h2>
);

// ====== Бегущая строка (источники трафика) ======
type MarqueeProps = { items: string[]; speed?: number; gap?: number };
function ContinuousMarquee({ items, speed = 40, gap = 32 }: MarqueeProps) {
  const stripRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const recalc = () => {
      if (stripRef.current) {
        const rect = stripRef.current.getBoundingClientRect();
        setWidth(rect.width);
      }
    };
    recalc();
    const RO: any = (window as any).ResizeObserver;
    let ro: any;
    if (RO && stripRef.current) {
      ro = new RO(recalc);
      ro.observe(stripRef.current);
    }
    window.addEventListener("resize", recalc);
    return () => {
      if (ro && stripRef.current) ro.disconnect();
      window.removeEventListener("resize", recalc);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = now - prev;
      prev = now;
      setOffset((o) => {
        if (width <= 0) return 0;
        const next = (o + (speed * dt) / 1000) % width;
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed, width]);

  const strip = (key: string, x: number) => (
    <div
      key={key}
      ref={key === "a" ? stripRef : null}
      className="absolute left-0 top-0 inline-flex items-center text-xs text-zinc-500"
      style={{ transform: `translateX(${x}px)`, gap: `${gap}px`, whiteSpace: "nowrap", padding: "8px 0" }}
    >
      {items.map((t: string, i: number) => (<span key={`${key}-${i}`} className="opacity-80">{t}</span>))}
      <span aria-hidden="true" style={{ display: "inline-block", width: gap }} />
    </div>
  );

  const x1 = -offset; const x2 = width - offset;
  return (
    <div className="relative overflow-hidden border-t border-zinc-200">
      <div className="relative h-[34px]">
        {strip("a", x1)}
        {strip("b", x2)}
      </div>
    </div>
  );
}

// ====== Header ======
function Header({ onQuiz }: { onQuiz: () => void }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);

  useEffect(() => {
    const handler = (e: any) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute('href');
      if (id && id.startsWith('#') && id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
          setOpen(false);
        }
      }
    };
    const nav = document.getElementById('main-nav');
    if (nav) nav.addEventListener('click', handler);
    return () => nav && nav.removeEventListener('click', handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/70 backdrop-blur">
      <nav id="main-nav" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <a href="#home" className="text-sm font-semibold tracking-tight">TraffAgent</a>
        <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          <a href="#services" className="hover:text-zinc-100">Услуги</a>
          <a href="#inside" className="hover:text-zinc-100">Внутри</a>
          <a href="#cases" className="hover:text-zinc-100">Кейсы</a>
          <a href="#pricing" className="hover:text-zinc-100">Тарифы</a>
          <a href="#faq" className="hover:text-zinc-100">FAQ</a>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { fbqTrack('Lead', { place: 'header_start' }); onQuiz(); }} className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-900">
            Начать <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={toggle} aria-label="Открыть меню" className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10">
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
            <button onClick={() => { toggle(); fbqTrack('Lead', { place: 'menu_write' }); onQuiz(); }} className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 font-semibold text-zinc-900">
              Написать
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

// ====== KP-style Mobile Hero ======
function KPMobileHero({ onQuiz }: { onQuiz: () => void }) {
  return (
    <Section id="home" className="pt-3 pb-6 sm:pb-8 sm:pt-10" bg="bg-white text-black">
      <div className="mx-auto max-w-6xl px-3">
        <div className="rounded-md overflow-hidden border border-zinc-200 shadow-sm">
          <div className="bg-red-600 text-white px-3 py-2 flex items-center justify-between">
            <div className="text-[11px] font-extrabold uppercase tracking-wider">Срочно</div>
            <div className="text-[11px] font-semibold">Объявление</div>
          </div>

          <div className="px-3 py-3 space-y-2">
            <div className="inline-flex items-center gap-2">
              <span className="bg-yellow-400 text-black text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">Эксклюзив</span>
              <span className="text-[10px] text-zinc-600">TraffAgent • медиа баинг</span>
            </div>

            <h1 className="text-[26px] leading-7 font-extrabold uppercase tracking-tight">
              Трафик без границ
            </h1>

            <p className="text-[13px] text-zinc-700">
              Выходим за пределы стандартного таргета: медиабаинг, креативы, аналитика и автоматизация,
              которые превращают клики в прибыль.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2">
              <button
                onClick={() => { fbqTrack('Lead', { place: 'kp_mobile_start' }); onQuiz(); }}
                className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-3 text-[13px] font-extrabold uppercase tracking-wide"
              >
                Хочу продажи
              </button>
              <a
                href="https://t.me/traffagent"
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => fbqTrack('Lead', { place: 'kp_mobile_tg' })}
                className="inline-flex items-center justify-center rounded-md border border-zinc-900 px-4 py-3 text-[13px] font-extrabод uppercase tracking-wide"
              >
                Похуй, делаем!
              </a>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ====== Hero (мобайл/десктоп) ======
function Hero({ onQuiz }: { onQuiz: () => void }) {
  const sources = [
    "META (Facebook - Instagram - Threads)",
    "YouTube",
    "TikTok",
    "Google",
    "Telegram",
    "Twitter",
  ];
  return (
    <>
      {/* Mobile — таблоид */}
      <div className="sm:hidden">
        <KPMobileHero onQuiz={onQuiz} />
        <div className="px-4">
          <ContinuousMarquee items={sources} speed={40} gap={32} />
        </div>
      </div>

      {/* Desktop / Tablet — классический с красной плашкой */}
      <div className="hidden sm:block">
        <Section id="home" className="pt-14 pb-14 sm:pt-16 sm:pb-16" bg="bg-white text-zinc-900">
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
            <motion.div variants={item} className="lg:col-span-7">
              {/* красная плашка */}
              <div className="bg-red-600 text-white px-3 py-2 flex items-center justify-between rounded-md mb-6">
                <div className="text-[11px] font-extrabold uppercase tracking-wider">Срочно</div>
                <div className="text-[11px] font-semibold">Объявление</div>
              </div>

              <Kicker>Трафик без границ</Kicker>
              <h1 className="mt-2 text-3xl sm:text-4xl md:text-6xl font-extrabold leading-snug">
                TraffAgent - трафик без границ
              </h1>
              <p className="mt-4 max-w-2xl text-zinc-600 text-base sm:text-lg">
                Выходим за пределы стандартного таргета: медиабаинг, креативы, аналитика и автоматизация,
                которые превращают клики в прибыль.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3">
                <button
                  onClick={() => { fbqTrack('Lead', { place: 'hero_start' }); onQuiz(); }}
                  className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-base sm:text-sm font-semibold text-white w-full sm:w-auto"
                >
                  Хочу продажи
                </button>
                <a
                  href="https://t.me/traffagent"
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => fbqTrack('Lead', { place: 'hero_tg' })}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 px-5 py-3 text-base sm:text-sm font-semibold w-full sm:w-auto"
                >
                  Похуй, делаем!
                </a>
              </div>
            </motion.div>
            <div className="lg:col-span-12">
              <ContinuousMarquee items={sources} speed={40} gap={32} />
            </div>
          </motion.div>
        </Section>
      </div>
    </>
  );
}

// ====== Metrics ======
function Metrics() {
  const stats: [string, string][] = [
    ["3.7x", "средний ROAS"],
    ["120k+", "лидов за 12 мес."],
    ["350+", "креативов протестировано"],
    ["18", "источников трафика"],
  ];
  return (
    <Section id="metrics" className="py-10 sm:py-12" bg="bg-white text-zinc-900">
      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(([v, l], i) => (
          <li key={i} className="rounded-2xl border border-zinc-200 p-4 text-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-semibold">{v}</div>
            <div className="text-[11px] sm:text-xs text-zinc-500 mt-1">{l}</div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ====== Services ======
function Services({ onQuiz }: { onQuiz: () => void }) {
  const groups = [
    { title: "Медиабаинг + Комплаенс", desc: "Meta, Google, TikTok, альтернативы. Anti-ban, прогрев, резервы.", bullets: ["Гипотезы и тесты", "Масштабирование", "Кейсы по вайт/грей"] },
    { title: "Креативы + Продакшн", desc: "UGC, статик, видео. Быстрые пачки и итерации.", bullets: ["Сториборды", "Сплиты и вариации", "CTR/CR рост"] },
    { title: "Воронки + Автоматизация", desc: "Квизы, чат-боты, CRM. Правила и скрипты для оптимизаций.", bullets: ["Квизы и LP", "Боты и ретеншн", "Правила/скрипты"] },
    { title: "Аналитика + Отчетность", desc: "Серверный трекинг, событийная модель, сводка в BI.", bullets: ["Сквозная аналитика", "Дашборды", "KPI weekly"] },
  ];
  return (
    <Section id="services" className="py-10 sm:py-12" bg="bg-zinc-950 text-zinc-100">
      <Kicker>Что мы делаем</Kicker>
      <H2>Услуги</H2>
      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        {groups.map((g, i) => (
          <li key={i} className="rounded-2xl border border-white/10 p-4 flex flex-col justify-between">
            <div>
              <div className="font-medium text-base sm:text-[15px]">{g.title}</div>
              <p className="mt-1 text-zinc-400">{g.desc}</p>
              <ul className="mt-3 space-y-1 text-[12px] sm:text-xs text-zinc-500">
                {g.bullets.map((b, idx) => (
                  <li key={idx} className="flex items-center gap-2"><Check className="h-4 w-4" /> {b}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => { fbqTrack('Lead', { place: 'services_card', title: g.title }); onQuiz(); }}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-white text-black px-4 py-2 text-sm font-medium w-full"
            >
              Хочу продажи
            </button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ====== Inside ======
function Inside() {
  const steps: [string, string][] = [
    ["Discovery", "Погружаемся в продукт, аудиторию и цели. KPI и рамки."],
    ["Стратегия", "Каналы, воронки, креативы, бюджет по спринтам."],
    ["Продакшн", "Креативы, лендинги/квизы, трекинг и CRM."],
    ["Запуск", "Закупка трафика, быстрые итерации, анти-бан."],
    ["Рост", "Оптимизация по LTV/ROAS, автоматизация, масштаб."],
  ];
  return (
    <Section id="inside" className="py-10 sm:py-12" bg="bg-white text-black">
      <Kicker>Как это устроено</Kicker>
      <H2>Внутри TraffAgent</H2>
      <ol className="mt-6 space-y-3">
        {steps.map(([t, d], i) => (
          <li key={i} className="rounded-2xl border border-zinc-200 p-4">
            <div className="text-sm sm:text-[15px] font-medium">{String(i + 1).padStart(2, "0")}. {t}</div>
            <p className="mt-1 text-sm text-zinc-600">{d}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

// ====== Cases ======
function Cases() {
  const list: [string, string, string][] = [
    ["FinTech SaaS", "+212% MRR", "Google + LinkedIn + контент"],
    ["eCom здоровье", "ROAS 4.1", "TikTok UGC + квиз"],
    ["EdTech mobile", "CPI -37%", "Meta + пачки креативов"],
  ];
  return (
    <Section id="cases" className="py-10 sm:py-12" bg="bg-zinc-950 text-zinc-100">
      <Kicker>Партнеры</Kicker>
      <H2>Кейсы</H2>
      <ul className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        {list.map(([name, res, desc], i) => (
          <li key={i} className="rounded-2xl border border-white/10 p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="font-medium">{name}</h3>
              <span className="text-xs font-semibold text-emerald-400">{res}</span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">{desc}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ====== Pricing ======
function Pricing({ onQuiz }: { onQuiz: () => void }) {
  const plans = [
    { name: "Старт", price: "от $1k", desc: "Для тестов и первых продаж", features: ["Стратегия", "3-5 подходов", "1-2 канала", "Еженед. отчет"], highlight: false },
    { name: "Рост", price: "% от спенда + $5k", desc: "Для стабильного масштабирования", features: ["Пачки креативов", "Мультиканальный баинг", "Сквозная аналитика", "Автоматизация"], highlight: true },
    { name: "Скейл", price: "кастом", desc: "Под высокие бюджеты и KPI", features: ["Кастомная команда", "R&D и анти-бан", "Серверный трекинг", "SLA по KPI"], highlight: false },
  ];
  return (
    <Section id="pricing" className="py-10 sm:py-12" bg="bg-white text-zinc-900">
      <Kicker>Прозрачные условия</Kicker>
      <H2 className="text-black">Тарифы</H2>
      <ul className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        {plans.map((p, i) => (
          <li key={i} className={`rounded-2xl border p-5 ${p.highlight ? "border-zinc-300" : "border-zinc-200"}`}>
            {p.highlight && (<span className="mb-3 inline-block rounded-full border border-zinc-300 px-2 py-0.5 text-xs">Популярный</span>)}
            <div className="text-lg font-semibold">{p.name}</div>
            <div className="mt-1 text-2xl font-bold">{p.price}</div>
            <p className="mt-1 text-sm text-zinc-600">{p.desc}</p>
            <ul className="mt-4 space-y-1 text-sm text-zinc-600">
              {p.features.map((f, idx) => (<li key={idx} className="flex items-center gap-2"><Check className="h-4 w-4" /> {f}</li>))}
            </ul>
            <button
              onClick={() => { fbqTrack('Lead', { place: 'pricing', plan: p.name }); onQuiz(); }}
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white w-full"
            >
              Берем
            </button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ====== FAQ ======
function FAQ() {
  const qa: [string, string][] = [
    ["С какими вертикалями работаете?", "E-com, edtech, подписки, mobile, SaaS, финтех."],
    ["Когда ждать результат?", "Первые инсайты за 7-14 дней спринта, масштаб 1-2 месяца."],
    ["Как считаете атрибуцию?", "Серверный трекинг, событийная модель, сводка в BI."],
  ];
  return (
    <Section id="faq" className="py-10 sm:py-12" bg="bg-zinc-950 text-zinc-100">
      <Kicker>Вопросы</Kicker>
      <H2>FAQ</H2>
      <ul className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10">
        {qa.map(([q, a], i) => (
          <li key={i} className="p-4">
            <div className="text-sm font-medium">{q}</div>
            <p className="mt-1 text-sm text-zinc-400">{a}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ====== Footer (ссылки убраны) ======
function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 bg-zinc-950 text-zinc-400">
      <Section id="footer">
        <div className="flex flex-col md:flex-row items-start md:items-center justify_between gap-3">
          <div className="text-sm font-semibold text-zinc-100">TraffAgent</div>
          <p className="text-xs">(c) {new Date().getFullYear()} TraffAgent. Все права защищены.</p>
        </div>
      </Section>
    </footer>
  );
}

// ====== Quiz с финальным подтверждением ======
function QuizModal({ open, onClose }: { open: boolean; onClose: () => void; }) {
  async function sendLead(payload: any) {
    try {
      const text = [
        "Новая заявка TraffAgent",
        `Бюджет: ${payload.budget || '-'}`,
        `Ниша: ${payload.niche || '-'}`,
        `GEO: ${payload.geo || '-'}`,
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
      if (TG_BOT_TOKEN && TG_CHAT_ID) {
        await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: TG_CHAT_ID, text }),
          keepalive: true,
        });
      }
    } catch (err) {
      console.warn("Lead delivery failed", err);
    }
  }

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ budget: "", niche: "", geo: "" });
  const [selected, setSelected] = useState(false);
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!open) { setStep(0); setAnswers({ budget: "", niche: "", geo: "" }); setSelected(false); }
  }, [open]);

  const questions = [
    { key: "budget", text: "Какой у вас бюджет на месяц?", options: ["до $1k", "$1k-$5k", "$5k-$20k", "$20k+"] },
    { key: "niche",  text: "Какая ниша/продукт?", options: ["E-com", "SaaS", "Mobile", "Инфо", "Финтех", "Другое"] },
    { key: "geo",    text: "Целевые GEO/рынки?", options: ["EU", "US/CA", "MENA", "LatAm", "SEA", "Другое"] },
  ] as const;

  if (!open) return null;

  const tgLink = "https://t.me/traffagent";
  const summaryText = `Заявка TraffAgent - бюджет: ${answers.budget}; ниша: ${answers.niche}; GEO: ${answers.geo}`;

  const proceedToTG = (action: string) => {
    fbqTrack('Lead', { place: action, budget: answers.budget, niche: answers.niche, geo: answers.geo });
    try { window.open(tgLink, "_blank", "noopener"); } catch {}
  };

  const choose = async (opt: string) => {
    if (step < questions.length) {
      const key = questions[step].key as keyof typeof answers;
      const nextAnswers = { ...answers, [key]: opt };
      setAnswers(nextAnswers);
      const lastIndex = questions.length - 1;
      if (step < lastIndex) {
        setStep(step + 1);
      } else {
        await sendLead(nextAnswers);
        setStep(step + 1); // финальная страница-подтверждение
      }
    }
  };

  const selectSummary = () => {
    setSelected(false);
    try {
      if (textRef.current) {
        textRef.current.removeAttribute("disabled");
        textRef.current.focus({ preventScroll: true });
        textRef.current.select();
        setSelected(true);
        textRef.current.setAttribute("disabled", "true");
      }
    } catch { setSelected(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/60" onClick={() => { proceedToTG('quiz_backdrop_close'); onClose(); }} />
      <div className="relative z-[101] w-full sm:max-w-lg rounded-т-2xl sm:rounded-2xl bg-white text-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <div className="text-sm font-semibold">Мини-квиз</div>
          <button onClick={() => { proceedToTG('quiz_x_close'); onClose(); }} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200" aria-label="Закрыть">x</button>
        </div>

        <div>
          {step < questions.length && (
            <div className="px-5 py-4">
              <div className="text-sm font-medium">{questions[step].text}</div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {questions[step].options.map((opt) => (
                  <button key={opt} onClick={() => choose(opt)} className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-left active:scale-[.99]">{opt}</button>
                ))}
              </div>
            </div>
          )}

          {step === questions.length && (
            <div className="px-5 py-5 space-y-4">
              <div className="text-sm font-medium">Почти готово — отправим заявку в Telegram?</div>
              <p className="text-sm text-zinc-600">Мы сохранили ваши ответы ниже. Можно скопировать и отправить в диалог.</p>
              <textarea ref={textRef} value={summaryText} readOnly disabled className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm text-zinc-700" />
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={tgLink}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => proceedToTG('quiz_confirm_submit')}
                  className="inline-flex items-center justify-center rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm font-semibold w-full sm:w-auto"
                >
                  Оставить заявку
                </a>
                <button onClick={selectSummary} className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-4 py-2 text-sm w-full sm:w-auto">
                  {selected ? "Текст выделен — жмите Ctrl/Cmd+C" : "Выделить ответы"}
                </button>
                <a
                  href={tgLink}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => proceedToTG('quiz_confirm_close')}
                  className="inline-flex items-center justify-center rounded-xl border border-зinc-300 px-4 py-2 text-sm w-full sm:w-auto"
                >
                  Закрыть
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 pt-2 flex items-center justify-between">
          <div className="text-xs text-zinc-500">Шаг {Math.min(step + 1, questions.length)} из {questions.length}</div>
          <div className="flex gap-2">
            {step > 0 && step <= questions.length - 1 && (
              <button onClick={() => setStep(step - 1)} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm">Назад</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ====== Страница ======
export function TraffAgentLanding() {
  const [quizOpen, setQuizOpen] = useState(false);
  useEffect(() => { fbqTrack('ViewContent', { content_name: 'TraffAgent Landing' }); }, []);
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <Header onQuiz={() => setQuizOpen(true)} />
      <main>
        <Hero onQuiz={() => setQuizOpen(true)} />
        <Metrics />
        <Services onQuiz={() => setQuizOpen(true)} />
        <Inside />
        <Cases />
        <Pricing onQuiz={() => setQuizOpen(true)} />
        <FAQ />
      </main>
      <Footer />
      {/* Липкая мобильная кнопка */}
      <div className="fixed bottom-3 inset-x-3 sm:hidden z-30">
        <button
          onClick={() => { fbqTrack('Lead', { place: 'sticky_mobile_cta' }); setQuizOpen(true); }}
          className="flex items-center justify-center rounded-xl bg-white text-zinc-900 px-4 py-3 text-base font-semibold shadow-lg shadow-black/30 w-full"
        >
          Берем - обсудить проект
        </button>
      </div>
      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} />
    </div>
  );
}

export default function App() { return <TraffAgentLanding />; }
