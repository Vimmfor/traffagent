import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Menu, Sparkles, X } from "lucide-react";

/* ---------- helpers ---------- */
declare global { interface Window { fbq?: (...args: any[]) => void } }
const fbqTrack = (event: string, params?: Record<string, any>) => {
  try { window.fbq && window.fbq("track", event, params || {}) } catch {}
};
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

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

/* ---------- Header ---------- */
function Header({ onQuiz }: { onQuiz: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/70 backdrop-blur">
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
        <a href="#home" className="text-sm font-semibold tracking-tight">TraffAgent</a>
        <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          <a href="#services" className="hover:text-zinc-100">Услуги</a>
          <a href="#inside" className="hover:text-zinc-100">Внутри</a>
          <a href="#cases" className="hover:text-zinc-100">Кейсы</a>
          <a href="#pricing" className="hover:text-zinc-100">Тарифы</a>
          <a href="#faq" className="hover:text-zinc-100">FAQ</a>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { fbqTrack("Lead", { place: "header_start" }); onQuiz(); }}
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-900"
          >
            Начать <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setOpen(!open)}
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
            <a href="#services" className="py-3" onClick={()=>setOpen(false)}>Услуги</a>
            <a href="#inside" className="py-3" onClick={()=>setOpen(false)}>Внутри</a>
            <a href="#cases" className="py-3" onClick={()=>setOpen(false)}>Кейсы</a>
            <a href="#pricing" className="py-3" onClick={()=>setOpen(false)}>Тарифы</a>
            <a href="#faq" className="py-3" onClick={()=>setOpen(false)}>FAQ</a>
            <button
              onClick={() => { setOpen(false); fbqTrack("Lead", { place: "menu_write" }); onQuiz(); }}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 font-semibold text-zinc-900"
            >
              Написать
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------- Marquee ---------- */
function ContinuousMarquee({ items, speed = 40, gap = 24 }: { items: string[]; speed?: number; gap?: number }) {
  const stripRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const recalc = () => { if (stripRef.current) setWidth(stripRef.current.getBoundingClientRect().width); };
    recalc();
    const RO: any = (window as any).ResizeObserver;
    let ro: any;
    if (RO && stripRef.current) { ro = new RO(recalc); ro.observe(stripRef.current); }
    window.addEventListener("resize", recalc);
    return () => { if (ro && stripRef.current) ro.disconnect(); window.removeEventListener("resize", recalc); };
  }, []);

  useEffect(() => {
    let raf = 0, prev = performance.now();
    const tick = (now: number) => {
      const dt = now - prev; prev = now;
      setOffset(o => width <= 0 ? 0 : (o + (speed * dt) / 1000) % width);
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
      {items.map((t, i) => (<span key={`${key}-${i}`} className="opacity-80">{t}</span>))}
      <span aria-hidden="true" style={{ display: "inline-block", width: gap }} />
    </div>
  );
  const x1 = -offset, x2 = width - offset;
  return (
    <div className="relative overflow-hidden">
      <div className="relative h-[34px]">
        {strip("a", x1)}
        {strip("b", x2)}
      </div>
    </div>
  );
}

/* ---------- Mobile Hero ---------- */
function KPMobileHero({ onQuiz }: { onQuiz: () => void }) {
  const sources = ["META (Facebook • Instagram • Threads)", "YouTube", "TikTok", "Google", "Telegram", "Twitter / X", "LinkedIn", "Reddit"];

  return (
    <Section
      id="home"
      className="min-h-[82vh] flex flex-col justify-start pt-0 pb-0 sm:pt-12 sm:pb-12"
      bg="bg-white text-black"
    >
      <div className="-mx-4 sm:mx-0">
        <div className="overflow-hidden border border-zinc-200 sm:rounded-md">
          {/* верхняя плашка */}
          <div className="bg-red-600 text-white px-3 py-2 flex items-center justify-between">
            <div className="text-[11px] font-extrabold uppercase tracking-wider">Срочно</div>
            <div className="text-[11px] font-semibold">Объявление</div>
          </div>

          {/* контент */}
          <div className="px-4 sm:px-5 py-4 sm:py-6 space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="bg-yellow-400 text-black text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">Эксклюзив</span>
              <span className="text-[10px] text-zinc-600">TraffAgent • медиа баинг</span>
            </div>

            <h1 className="text-[32px] leading-[1.08] font-extrabold tracking-tight sm:text-[40px]">
              Traffagent - трафик без границ
            </h1>

            <p className="text-[15px] leading-snug text-zinc-700 max-w-[46ch] sm:text-[16px]">
              Выходим за пределы стандартного таргета: медиабаинг, креативы, аналитика и автоматизация, которые превращают клики в прибыль.
            </p>

            {/* CTA */}
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => { fbqTrack("Lead", { place: "kp_mobile_start" }); onQuiz(); }}
                className="inline-flex items-center justify-center rounded-none sm:rounded-md bg-black text-white px-5 py-4 text-[16px] font-extrabold uppercase tracking-wide w-full"
              >
                Хочу продажи
              </button>
              <button
                onClick={() => { fbqTrack("Lead", { place: "kp_mobile_tg" }); onQuiz(); }}
                className="inline-flex items-center justify-center rounded-none sm:rounded-md border border-zinc-900 px-5 py-4 text-[16px] font-extrabold uppercase tracking-wide w-full"
              >
                Похуй, делаем!
              </button>
            </div>
          </div>

          {/* одна бегущая строка — сразу под кнопками */}
          <div className="border-t border-zinc-200">
            <ContinuousMarquee items={sources} speed={40} gap={24} />
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------- Desktop Hero (улучшенный вариант) ---------- */
function Hero({ onQuiz }: { onQuiz: () => void }) {
  const sources = ["META (Facebook • Instagram • Threads)", "YouTube", "TikTok", "Google", "Telegram", "Twitter / X", "LinkedIn", "Reddit"];
  return (
    <>
      {/* МОБИЛКА */}
      <div className="sm:hidden">
        <KPMobileHero onQuiz={onQuiz} />
      </div>

      {/* ДЕСКТОП/ПЛАНШЕТ */}
      <div className="hidden sm:block">
        <Section id="home" className="pt-12 pb-8" bg="bg-white text-zinc-900">
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
            <motion.div variants={item} className="lg:col-span-7">
              <div className="bg-red-600 text-white px-3 py-2 flex items-center justify-between rounded-md mb-4">
                <div className="text-[11px] font-extrabold uppercase tracking-wider">Срочно</div>
                <div className="text-[11px] font-semibold">Объявление</div>
              </div>
              <Kicker>Трафик без границ</Kicker>
              <h1 className="mt-2 text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
                Traffagent - трафик без границ
              </h1>
              <p className="mt-4 max-w-2xl text-zinc-600 text-base sm:text-lg">
                Выходим за пределы стандартного таргета: медиабаинг, креативы, аналитика и автоматизация, которые превращают клики в прибыль.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row sm:flex-wrap gap-3">
                <button onClick={() => { fbqTrack("Lead", { place: "hero_start" }); onQuiz(); }} className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-base sm:text-sm font-semibold text-white w-full sm:w-auto">
                  Хочу продажи
                </button>
                <button onClick={() => { fbqTrack("Lead", { place: "hero_tg" }); onQuiz(); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 px-5 py-3 text-base sm:text-sm font-semibold w-full sm:w-auto">
                  Похуй, делаем!
                </button>
              </div>
            </motion.div>

            <div className="lg:col-span-12">
              <div className="border-t border-zinc-200">
                <ContinuousMarquee items={sources} speed={40} gap={24} />
              </div>
            </div>
          </motion.div>
        </Section>
      </div>
    </>
  );
}

/* ---------- Metrics (единственная секция с подтянутым верхом) ---------- */
function Metrics() {
  const stats: [string, string][] = [
    ["3.7x","средний ROAS"],["120k+","лидов за 12 мес."],
    ["350+","креативов протестировано"],["18","источников трафика"],
  ];
  return (
    <Section
      id="metrics"
      className="pt-0 pb-10 sm:pt-8 sm:pb-12"
      bg="bg-white text-zinc-900"
    >
      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(([v,l],i)=>(
          <li key={i} className="rounded-2xl border border-zinc-200 p-4 text-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-semibold">{v}</div>
            <div className="text-[11px] sm:text-xs text-zinc-500 mt-1">{l}</div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ---------- Services ---------- */
function Services({ onQuiz }: { onQuiz: () => void }) {
  const groups = [
    { title:"Медиабаинг + Комплаенс", desc:"Meta, Google, TikTok, альтернативы. Anti-ban, прогрев, резервы.", bullets:["Гипотезы и тесты","Масштабирование","Кейсы по вайт/грей"] },
    { title:"Креативы + Продакшн", desc:"UGC, статик, видео. Быстрые пачки и итерации.", bullets:["Сториборды","Сплиты и вариации","CTR/CR рост"] },
    { title:"Воронки + Автоматизация", desc:"Квизы, чат-боты, CRM. Правила и скрипты для оптимизаций.", bullets:["Квизы и LP","Боты и ретеншн","Правила/скрипты"] },
    { title:"Аналитика + Отчетность", desc:"Серверный трекинг, событийная модель, сводка в BI.", bullets:["Сквозная аналитика","Дашборды","KPI weekly"] },
  ];
  return (
    <Section id="services" className="pt-12 pb-12" bg="bg-zinc-950 text-zinc-100">
      <Kicker>Что мы делаем</Kicker>
      <H2>Услуги</H2>
      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        {groups.map((g,i)=>(
          <li key={i} className="rounded-2xl border border-white/10 p-4 flex flex-col justify-between">
            <div>
              <div className="font-medium text-base sm:text-[15px]">{g.title}</div>
              <p className="mt-1 text-zinc-400">{g.desc}</p>
              <ul className="mt-3 space-y-1 text-[12px] sm:text-xs text-zinc-500">
                {g.bullets.map((b,idx)=>(
                  <li key={idx} className="flex items-center gap-2"><Check className="h-4 w-4" /> {b}</li>
                ))}
              </ul>
            </div>
            <button onClick={()=>{ fbqTrack("Lead",{place:"services_card",title:g.title}); onQuiz(); }} className="mt-4 inline-flex items-center justify-center rounded-xl bg-white text-black px-4 py-2 text-sm font-medium w-full">
              Хочу продажи
            </button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ---------- Inside ---------- */
function Inside() {
  const steps: [string,string][] = [
    ["Discovery","Погружаемся в продукт, аудиторию и цели. KPI и рамки."],
    ["Стратегия","Каналы, воронки, креативы, бюджет по спринтам."],
    ["Продакшн","Креативы, лендинги/квизы, трекинг и CRM."],
    ["Запуск","Закупка трафика, быстрые итерации, анти-бан."],
    ["Рост","Оптимизация по LTV/ROAS, автоматизация, масштаб."],
  ];
  return (
    <Section id="inside" className="pt-12 pb-12" bg="bg-white text-black">
      <Kicker>Как это устроено</Kicker>
      <H2>Внутри TraffAgent</H2>
      <ol className="mt-6 space-y-3">
        {steps.map(([t,d],i)=>(
          <li key={i} className="rounded-2xl border border-zinc-200 p-4">
            <div className="text-sm sm:text-[15px] font-medium">{String(i+1).padStart(2,"0")}. {t}</div>
            <p className="mt-1 text-sm text-zinc-600">{d}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ---------- Cases ---------- */
function Cases() {
  const list: [string,string,string][] = [
    ["FinTech SaaS","+212% MRR","Google + LinkedIn + контент"],
    ["eCom здоровье","ROAS 4.1","TikTok UGC + квиз"],
    ["EdTech mobile","CPI -37%","Meta + пачки креативов"],
  ];
  return (
    <Section id="cases" className="pt-12 pb-12" bg="bg-zinc-950 text-zinc-100">
      <Kicker>Партнеры</Kicker>
      <H2>Кейсы</H2>
      <ul className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        {list.map(([name,res,desc],i)=>(
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

/* ---------- Pricing ---------- */
function Pricing({ onQuiz }: { onQuiz: () => void }) {
  const plans = [
    { name:"Старт", price:"от $1k", desc:"Для тестов и первых продаж", features:["Стратегия","3-5 подходов","1-2 канала","Еженед. отчет"], highlight:false },
    { name:"Рост", price:"% от спенда + $5k", desc:"Для стабильного масштабирования", features:["Пачки креативов","Мультиканальный баинг","Сквозная аналитика","Автоматизация"], highlight:true },
    { name:"Скейл", price:"кастом", desc:"Под высокие бюджеты и KPI", features:["Кастомная команда","R&D и анти-бан","Серверный трекинг","SLA по KPI"], highlight:false },
  ];
  return (
    <Section id="pricing" className="pt-12 pb-12" bg="bg-white text-zinc-900">
      <Kicker>Прозрачные условия</Kicker>
      <H2 className="text-black">Тарифы</H2>
      <ul className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        {plans.map((p,i)=>(
          <li key={i} className={`rounded-2xl border p-5 ${p.highlight ? "border-zinc-300" : "border-zinc-200"}`}>
            {p.highlight && (<span className="mb-3 inline-block rounded-full border border-zinc-300 px-2 py-0.5 text-xs">Популярный</span>)}
            <div className="text-lg font-semibold">{p.name}</div>
            <div className="mt-1 text-2xl font-bold">{p.price}</div>
            <p className="mt-1 text-sm text-zinc-600">{p.desc}</p>
            <ul className="mt-4 space-y-1 text-sm text-zinc-600">
              {p.features.map((f,idx)=>(<li key={idx} className="flex items-center gap-2"><Check className="h-4 w-4" /> {f}</li>))}
            </ul>
            <button onClick={()=>{ fbqTrack("Lead",{place:"pricing",plan:p.name}); onQuiz(); }} className="mt-5 inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white w-full">
              Берем
            </button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ---------- FAQ ---------- */
function FAQ() {
  const qa: [string,string][] = [
    ["С какими вертикалями работаете?","E-com, edtech, подписки, mobile, SaaS, финтех."],
    ["Когда ждать результат?","Первые инсайты за 7–14 дней спринта, масштаб 1–2 месяца."],
    ["Как считаете атрибуцию?","Серверный трекинг, событийная модель, сводка в BI."],
  ];
  return (
    <Section id="faq" className="pt-12 pb-12" bg="bg-zinc-950 text-zinc-100">
      <Kicker>Вопросы</Kicker>
      <H2>FAQ</H2>
      <ul className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10">
        {qa.map(([q,a],i)=>(
          <li key={i} className="p-4">
            <div className="text-sm font-medium">{q}</div>
            <p className="mt-1 text-sm text-zinc-400">{a}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ---------- Мини-квиз (модалка) ---------- */
function QuizModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ budget: "", niche: "", geo: "" });
  const [copied, setCopied] = useState(false);
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(()=>{ if(!open){ setStep(0); setAnswers({budget:"",niche:"",geo:""}); setCopied(false);} },[open]);

  const questions = [
    { key:"budget", text:"Какой у вас бюджет на месяц?", options:["до $1k","$1k-$5k","$5k-$20k","$20k+"] },
    { key:"niche",  text:"Какая ниша/продукт?",       options:["E-com","SaaS","Mobile","Инфо","Финтех","Другое"] },
    { key:"geo",    text:"Целевые GEO/рынки?",        options:["EU","US/CA","MENA","LatAm","SEA","Другое"] },
  ] as const;

  if (!open) return null;

  const tgLink = "https://t.me/traffagent";
  const summaryText = `Заявка TraffAgent — бюджет: ${answers.budget}; ниша: ${answers.niche}; GEO: ${answers.geo}`;

  const choose = (opt: string) => {
    const q = questions[step];
    setAnswers(prev => ({ ...prev, [q.key]: opt }));
    if (step < questions.length - 1) setStep(step + 1);
    else setStep(step + 1);
  };

  const copySummary = () => {
    try { navigator.clipboard.writeText(summaryText); setCopied(true); setTimeout(()=>setCopied(false),1500); }
    catch {
      if (textRef.current) {
        textRef.current.removeAttribute("disabled");
        textRef.current.focus({ preventScroll: true });
        textRef.current.select();
        textRef.current.setAttribute("disabled","true");
      }
    }
  };

  const goTG = (place: string) => {
    fbqTrack("Lead", { place, ...answers });
    try { window.open(tgLink, "_blank", "noopener"); } catch {}
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/60" onClick={() => { goTG("quiz_backdrop_close"); onClose(); }} />
      <div className="relative z-[101] w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white text-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <div className="text-sm font-semibold">Мини-квиз</div>
          <button onClick={() => { goTG("quiz_x_close"); onClose(); }} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200" aria-label="Закрыть">
            <X className="h-4 w-4" />
          </button>
        </div>

        {step < questions.length ? (
          <div className="px-5 py-4">
            <div className="text-sm font-medium">{questions[step].text}</div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {questions[step].options.map(opt => (
                <button key={opt} onClick={() => choose(opt)} className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-left active:scale-[.99]">
                  {opt}
                </button>
              ))}
            </div>
            <div className="mt-3 text-xs text-zinc-500">Шаг {step + 1} из {questions.length}</div>
          </div>
        ) : (
          <div className="px-5 py-5 space-y-4">
            <div className="text-sm font-medium">Почти готово — отправим заявку в Telegram?</div>
            <p className="text-sm text-zinc-600">Ваши ответы ниже. Можно скопировать и отправить в чат.</p>
            <textarea ref={textRef} value={summaryText} readOnly disabled className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm text-zinc-700" />
            <div className="flex flex-col sm:flex-row gap-2">
              <a href={tgLink} target="_blank" rel="noreferrer noopener" onClick={() => goTG("quiz_confirm_submit")} className="inline-flex items-center justify-center rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm font-semibold w-full sm:w-auto">
                Оставить заявку
              </a>
              <button onClick={copySummary} className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-4 py-2 text-sm w-full sm:w-auto">
                {copied ? "Скопировано!" : "Скопировать ответы"}
              </button>
              <a href={tgLink} target="_blank" rel="noreferrer noopener" onClick={() => goTG("quiz_confirm_close")} className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-4 py-2 text-sm w-full sm:w-auto">
                Закрыть
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Footer ---------- */
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

/* ---------- Page ---------- */
export default function App() {
  const [quizOpen, setQuizOpen] = useState(false);
  useEffect(()=>{ fbqTrack("ViewContent",{ content_name:"TraffAgent Landing" }) },[]);
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
      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} />
    </div>
  );
}
