import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Menu, Sparkles, X } from "lucide-react";

/**
 * Полный App.tsx
 * - Обновлённый Hero: только цветной слоган (без слова TraffAgent), увеличен размер
 * - Насыщенная бегущая строка (выше, крупнее, с разделителями и фоном)
 * - Ровные кнопки в «Услуги» и «Тарифы» (h-full flex-col + mt-auto)
 * - Квиз, якоря, анимации
 */

// ==== опциональные интеграции (пока пустые) ====
const LEAD_WEBHOOK = "";
const TG_BOT_TOKEN = "";
const TG_CHAT_ID = "";
declare global { interface Window { __TG_TOKEN__?: string; __TG_CHAT__?: string; } }
const BOT_TOKEN = (typeof window !== "undefined" && window.__TG_TOKEN__) || TG_BOT_TOKEN;
const CHAT_ID   = (typeof window !== "undefined" && window.__TG_CHAT__)  || TG_CHAT_ID;

// ==== анимации ====
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

// ==== утилиты ====
function Section({ id, children, className = "", bg = "" }: { id?: string; children: React.ReactNode; className?: string; bg?: string }) {
  return <section id={id} className={`${bg} relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</section>;
}
function Kicker({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 ${className}`}><Sparkles className="h-3.5 w-3.5" /> {children}</span>;
}
function H2({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`mt-2 text-[22px] sm:text-2xl md:text-4xl font-semibold leading-tight tracking-tight ${className}`}>{children}</h2>;
}

// ==== бегущая строка (крупнее и насыщеннее) ====
function ContinuousMarquee({ items, speed = 55, gap = 72 }: { items: string[]; speed?: number; gap?: number }) {
  const stripRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);
  const [width, setWidth] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const recalc = () => { if (stripRef.current) setWidth(stripRef.current.getBoundingClientRect().width); };
    recalc();
    const RO = (window as any).ResizeObserver;
    let ro: any;
    if (RO && stripRef.current) { ro = new RO(recalc); ro.observe(stripRef.current); }
    window.addEventListener("resize", recalc);
    return () => { if (ro && stripRef.current) ro.disconnect(); window.removeEventListener("resize", recalc); };
  }, []);

  useEffect(() => {
    if (prefersReduced) return;
    let raf = 0; let prev = performance.now();
    const tick = (now: number) => {
      const dt = now - prev; prev = now;
      setOffset(o => (width <= 0 ? 0 : (o + (speed * dt) / 1000) % width));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed, width, prefersReduced]);

  const strip = (k: string, x: number) => (
    <div
      key={k}
      ref={k==="a"?stripRef:null}
      className="absolute left-0 top-0 inline-flex items-center font-medium uppercase tracking-wide text-zinc-700"
      style={{ transform: `translateX(${x}px)`, gap: `${gap}px`, whiteSpace: "nowrap", padding: "10px 0" }}
    >
      {items.map((t, i) => (
        <React.Fragment key={`${k}-${i}`}>
          <span className="opacity-90">{t}</span>
          {i !== items.length - 1 && <span aria-hidden="true" className="mx-3">•</span>}
        </React.Fragment>
      ))}
      <span aria-hidden="true" style={{ display: "inline-block", width: gap }} />
    </div>
  );

  const x1 = -offset, x2 = width - offset;
  return (
    <div className="relative overflow-hidden border-y border-zinc-200 bg-zinc-50">
      <div className="relative h-[56px] sm:h-[64px] px-2 sm:px-4">
        {strip("a", x1)}
        {strip("b", x2)}
      </div>
    </div>
  );
}

// ==== Header ====
function Header({ onQuiz }: { onQuiz: () => void }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const handler = (e: any) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null; if (!a) return;
      const id = a.getAttribute('href'); if (id && id.startsWith('#') && id.length>1) {
        const el = document.querySelector(id); if (el) { e.preventDefault(); (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' }); setOpen(false); }
      }
    };
    const nav = document.getElementById('main-nav'); if (nav) nav.addEventListener('click', handler); return () => nav && nav.removeEventListener('click', handler);
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
          <button type="button" onClick={onQuiz} className="group hidden sm:inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-3 py-2 text-sm font-semibold text-white shadow hover:shadow-lg transition-shadow">
            Запустить траф <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button type="button" onClick={() => setOpen(v=>!v)} aria-label="Открыть меню" className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
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
            <button type="button" onClick={() => { setOpen(false); onQuiz(); }} className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-4 py-3 font-semibold text-white">Запустить траф</button>
          </div>
        </div>
      )}
    </header>
  );
}

// ==== Hero (без слова TraffAgent, только цветной слоган) ====
function Hero({ onQuiz }: { onQuiz: () => void }) {
  const prefersReduced = useReducedMotion();
  const sources = [
    "Meta (Facebook + Instagram + Threads)",
    "YouTube",
    "TikTok",
    "Google Ads",
    "Telegram",
    "Twitter / X",
    "LinkedIn Ads",
    "Reddit Ads",
    "Snapchat Ads"
  ];

  return (
    <Section id="home" className="pt-14 pb-16 sm:pt-16 sm:pb-20" bg="bg-white text-zinc-900">
      {!prefersReduced && (
        <>
          <div className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-gradient-to-tr from-indigo-400/40 via-purple-400/40 to-fuchsia-400/40 blur-3xl" />
          <div className="pointer-events-none absolute top-20 -right-10 h-56 w-56 rounded-full bg-gradient-to-tr from-sky-400/30 via-emerald-300/30 to-purple-400/30 blur-3xl" />
        </>
      )}
      <motion.div variants={container} initial="hidden" animate="show" className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
        <motion.div variants={item} className="lg:col-span-7">
          <Kicker>Performance-маркетинг под KPI</Kicker>
          <h1 className="mt-2 text-[40px] sm:text-6xl md:text-7xl font-extrabold leading-tight tracking-tight">
            <span className="gradient-text">performance маркетинг под KPI</span>
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-600 text-base sm:text-lg">
            Запускаем и масштабируем платный трафик под окупаемость и LTV. Креативы, закупка, аналитика и автоматизация.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3">
            <button type="button" onClick={onQuiz} className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-5 py-3 text-base sm:text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto">
              Запустить траф
            </button>
            <a href="https://t.me/traffagent" target="_blank" rel="noreferrer noopener" className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 px-5 py-3 text-base sm:text-sm font-semibold w-full sm:w-auto hover:bg-zinc-100 transition-colors">
              Похуй, делаем!
            </a>
          </div>
        </motion.div>

        {/* Бегущая строка - увеличенная полоса */}
        <div className="lg:col-span-12">
          <ContinuousMarquee items={sources} speed={55} gap={72} />
        </div>
      </motion.div>
    </Section>
  );
}

// ==== Metrics ====
function Metrics() {
  const stats: [string, string][] = [
    ["3.7x","средний ROAS"],
    ["120k+","лидов за 12 мес."],
    ["350+","креативов протестировано"],
    ["18","источников трафика"]
  ];
  return (
    <Section id="metrics" className="py-12" bg="bg-white text-zinc-900">
      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(([v, l], i) => (
          <li key={i} className="card rounded-2xl border border-zinc-200 p-5 text-center bg-white/70 backdrop-blur">
            <div className="text-2xl md:text-3xl font-semibold">{v}</div>
            <div className="text-xs text-zinc-500 mt-1">{l}</div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ==== Services (кнопки выровнены по низу) ====
function Services({ onQuiz }: { onQuiz: () => void }) {
  const groups = [
    { title: "Медиабаинг + Комплаенс", desc: "Meta, Google, TikTok, альтернативы. Anti-ban, прогрев, резервы.", bullets: ["Гипотезы и тесты", "Масштабирование", "Кейсы по вайт/грей"] },
    { title: "Креативы + Продакшн", desc: "UGC, статик, видео. Быстрые пачки и итерации.", bullets: ["Сториборды", "Сплиты и вариации", "CTR/CR рост"] },
    { title: "Воронки + Автоматизация", desc: "Квизы, чат-боты, CRM. Правила и скрипты для оптимизаций.", bullets: ["Квизы и LP", "Боты и ретеншн", "Правила/скрипты"] },
    { title: "Аналитика + Отчетность", desc: "Серверный трекинг, событийная модель, сводка в BI.", bullets: ["Сквозная аналитика", "Дашборды", "KPI weekly"] },
  ];
  return (
    <Section id="services" className="py-12" bg="bg-zinc-950 text-zinc-100">
      <Kicker>Что мы делаем</Kicker>
      <H2>Услуги</H2>
      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm items-stretch">
        {groups.map((g, i) => (
          <li key={i} className="card h-full flex flex-col rounded-2xl border border-white/10 p-4 bg-gradient-to-b from-white/5 to-transparent">
            <div className="h-1 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 mb-3" />
            <div className="flex-1">
              <div className="font-medium text-base sm:text-[15px]">{g.title}</div>
              <p className="mt-1 text-zinc-400">{g.desc}</p>
              <ul className="mt-3 space-y-1 text-[12px] sm:text-xs text-zinc-400">
                {g.bullets.map((b, idx) => (<li key={idx} className="flex items-center gap-2"><Check className="h-4 w-4 text-zinc-300" /> {b}</li>))}
              </ul>
            </div>
            <button
              type="button"
              onClick={onQuiz}
              className="mt-auto inline-flex items-center justify-center rounded-xl bg-white text-black px-4 py-2 text-sm font-medium w-full hover:bg-zinc-100 transition-colors"
            >
              Запустить траф
            </button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ==== Inside ====
function Inside() {
  const steps: [string, string][] = [
    ["Discovery","Погружаемся в продукт, аудиторию и цели. KPI и рамки."],
    ["Стратегия","Каналы, воронки, креативы, бюджет по спринтам."],
    ["Продакшн","Креативы, лендинги/квизы, трекинг и CRM."],
    ["Запуск","Закупка трафика, быстрые итерации, анти-бан."],
    ["Рост","Оптимизация по LTV/ROAS, автоматизация, масштаб."]
  ];
  return (
    <Section id="inside" className="py-12" bg="bg-white text-zinc-900">
      <Kicker>Как это устроено</Kicker>
      <H2>Внутри TraffAgent</H2>
      <ol className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map(([t, d], i) => (
          <li key={i} className="card rounded-2xl border border-zinc-200 p-4 bg-white/80 backdrop-blur">
            <div className="text-sm sm:text-[15px] font-medium">{String(i + 1).padStart(2, "0")}. {t}</div>
            <p className="mt-1 text-sm text-zinc-600">{d}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

// ==== Cases ====
function Cases() {
  const list: [string, string, string][] = [
    ["FinTech SaaS","+212% MRR","Google + LinkedIn + контент"],
    ["eCom здоровье","ROAS 4.1","TikTok UGC + квиз"],
    ["EdTech mobile","CPI -37%","Meta + пачки креативов"]
  ];
  return (
    <Section id="cases" className="py-12" bg="bg-zinc-950 text-zinc-100">
      <Kicker>Партнеры</Kicker>
      <H2>Кейсы</H2>
      <ul className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {list.map(([name, res, desc], i) => (
          <li key={i} className="card rounded-2xl border border-white/10 p-4 glass">
            <div className="flex items-baseline justify-between">
              <h3 className="font-medium">{name}</h3>
              <span className="text-xs font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 text-black rounded-full px-2 py-0.5">{res}</span>
            </div>
            <p className="mt-1 text-sm text-zinc-300">{desc}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ==== Pricing (кнопки выровнены по низу) ====
function Pricing({ onQuiz }: { onQuiz: () => void }) {
  const plans = [
    { name: "Старт", price: "от $1k", desc: "Для тестов и первых продаж", features: ["Стратегия", "3-5 подходов", "1-2 канала", "Еженед. отчет"], highlight: false },
    { name: "Рост",  price: "% от спенда + $5k", desc: "Для стабильного масштабирования", features: ["Пачки креативов", "Мультиканальный баинг", "Сквозная аналитика", "Автоматизация"], highlight: true },
    { name: "Скейл", price: "кастом", desc: "Под высокие бюджеты и KPI", features: ["Кастомная команда", "R&D и анти-бан", "Серверный трекинг", "SLA по KPI"], highlight: false },
  ];
  return (
    <Section id="pricing" className="py-12" bg="bg-white text-zinc-900">
      <Kicker>Прозрачные условия</Kicker>
      <H2 className="text-black">Тарифы</H2>
      <ul className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {plans.map((p, i) => (
          <li key={i} className={`card h-full flex flex-col rounded-2xl border p-5 bg-white/80 backdrop-blur ${p.highlight ? "border-zinc-300" : "border-zinc-200"}`}>
            {p.highlight && (<span className="mb-3 inline-block rounded-full border border-zinc-300 px-2 py-0.5 text-xs bg-gradient-to-r from-indigo-100 to-fuchsia-100">Популярный</span>)}
            <div className="text-lg font-semibold">{p.name}</div>
            <div className="mt-1 text-2xl font-bold">{p.price}</div>
            <p className="mt-1 text-sm text-zinc-600">{p.desc}</p>
            <ul className="mt-4 space-y-1 text-sm text-zinc-600">
              {p.features.map((f, idx) => (<li key={idx} className="flex items-center gap-2"><Check className="h-4 w-4 text-indigo-500" /> {f}</li>))}
            </ul>
            <button
              type="button"
              onClick={onQuiz}
              className="mt-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-4 py-3 text-sm font-medium text-white w-full shadow-lg hover:shadow-xl transition-shadow"
            >
              Берем
            </button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ==== FAQ ====
function FAQ() {
  const qa: [string, string][] = [
    ["С какими вертикалями работаете?","E-com, edtech, подписки, mobile, SaaS, финтех."],
    ["Когда ждать результат?","Первые инсайты за 7-14 дней спринта, масштаб 1-2 месяца."],
    ["Как считаете атрибуцию?","Серверный трекинг, событийная модель, сводка в BI."]
  ];
  return (
    <Section id="faq" className="py-12" bg="bg-zinc-950 text-zinc-100">
      <Kicker>Вопросы</Kicker>
      <H2>FAQ</H2>
      <ul className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 glass">
        {qa.map(([q, a], i) => (
          <li key={i} className="p-4">
            <div className="text-sm font-medium">{q}</div>
            <p className="mt-1 text-sm text-zinc-300">{a}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ==== Footer ====
function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 bg-zinc-950 text-zinc-400">
      <Section id="footer">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="text-sm font-semibold text-zinc-100">TraffAgent</div>
          <p className="text-xs">(c) {new Date().getFullYear()} TraffAgent. Все права защищены.</p>
        </div>
      </Section>
    </footer>
  );
}

// ==== Quiz ====
function QuizModal({ open, onClose }: { open: boolean; onClose: () => void; }) {
  async function sendLead(payload: any) {
    try {
      const text = [
        "Новая заявка TraffAgent",
        `Бюджет: ${payload.budget || '-'}`,
        `Ниша: ${payload.niche || '-'}`,
        `GEO: ${payload.geo || '-'}`,
        `UA: ${navigator.userAgent}`,
        `Time: ${new Date().toISOString()}`
      ].join("\n");
      if (LEAD_WEBHOOK) {
        await fetch(LEAD_WEBHOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, answers: payload }), keepalive: true });
        return;
      }
      if (BOT_TOKEN && CHAT_ID) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: CHAT_ID, text }), keepalive: true });
      }
    } catch {}
  }
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ budget: "", niche: "", geo: "" });
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => { if (!open) { setStep(0); setAnswers({ budget: "", niche: "", geo: "" }); } }, [open]);
  const questions = [
    { key: "budget", text: "Какой у вас бюджет на месяц?", options: ["до $1k", "$1k-$5k", "$5k-$20k", "$20k+"] },
    { key: "niche", text: "Какая ниша/продукт?", options: ["E-com", "SaaS", "Mobile", "Инфо", "Финтех", "Другое"] },
    { key: "geo", text: "Целевые GEO/рынки?", options: ["EU", "US/CA", "MENA", "LatAm", "SEA", "Другое"] },
  ] as const;
  if (!open) return null;
  const tgLink = "https://t.me/traffagent";
  const summaryText = `Заявка TraffAgent - бюджет: ${answers.budget}; ниша: ${answers.niche}; GEO: ${answers.geo}`;
  const choose = async (opt: string) => {
    if (step < questions.length) {
      const key = questions[step].key as keyof typeof answers;
      const nextAnswers = { ...answers, [key]: opt };
      setAnswers(nextAnswers);
      const lastIndex = questions.length - 1;
      if (step < lastIndex) setStep(step + 1);
      else { await sendLead(nextAnswers); try { window.open(tgLink, "_blank", "noopener"); } catch {} setStep(step + 1); }
    }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-[101] w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white text-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <div className="text-sm font-semibold">Мини-квиз</div>
          <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200" aria-label="Закрыть">×</button>
        </div>
        <div>
          <div>
            {step < questions.length && (
              <div className="px-5 py-4">
                <div className="text-sm font-medium">{questions[step].text}</div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {questions[step].options.map((opt) => (
                    <button type="button" key={opt} onClick={() => choose(opt)} className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-left active:scale-[.99]">{opt}</button>
                  ))}
                </div>
              </div>
            )}
            {step === questions.length && (
              <div className="px-5 py-5 space-y-4">
                <div className="text-sm font-medium">Готово! Мы открыли Telegram.</div>
                <p className="text-sm text-zinc-600">Если Telegram не открылся — нажмите кнопку ниже. Текст с ответами можно скопировать вручную.</p>
                <textarea ref={textRef} value={summaryText} readOnly className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm text-zinc-700" />
                <div className="flex flex-col sm:flex-row gap-2">
                  <a href={tgLink} target="_blank" rel="noreferrer noopener" className="inline-flex items-center justify-center rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm font-semibold w-full sm:w-auto">Перейти в Telegram</a>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="px-5 pb-5 pt-2 flex items-center justify-between">
          <div className="text-xs text-zinc-500">Шаг {Math.min(step + 1, questions.length)} из {questions.length}</div>
          <div className="flex gap-2">
            {step > 0 && step <= questions.length - 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm">Назад</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==== Корневой компонент ====
function TraffAgentLanding() {
  const [quizOpen, setQuizOpen] = useState(false);
  useEffect(() => {
    const defs: any = { Header, Hero, Metrics, Services, Inside, Cases, Pricing, FAQ, Footer };
    Object.entries(defs).forEach(([name, ref]) => console.assert(typeof ref === "function", `${name} should be defined`));
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-200">
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
      {/* мобильная CTA */}
      <div className="fixed bottom-3 inset-x-3 sm:hidden z-30">
        <button
          type="button"
          onClick={() => setQuizOpen(true)}
          className="flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 text-white px-4 py-3 text-base font-semibold shadow-lg shadow-black/30 w-full"
        >
          Берем - обсудить проект
        </button>
      </div>
      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} />
    </div>
  );
}

export default function App() { return <TraffAgentLanding />; }
