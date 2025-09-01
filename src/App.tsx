import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

// =======================
// ВСПОМОГАТЕЛЬНЫЕ
// =======================

function Section({ id, children, className = "", bg = "" }: { id?: string; children: React.ReactNode; className?: string; bg?: string }) {
  return (
    <section id={id} className={`${bg} relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </section>
  );
}

function Button({ children, onClick, href }: { children: React.ReactNode; onClick?: () => void; href?: string }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 font-medium shadow-sm transition active:scale-95";
  const styles = "bg-white text-black hover:bg-zinc-100";
  if (href) {
    return (
      <a href={href} className={`${base} ${styles}`}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

// =======================
// HERO
// =======================

function Hero({ onQuiz }: { onQuiz: () => void }) {
  return (
    <div className="relative bg-white text-black">
      <div className="mx-auto max-w-4xl py-20 text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl sm:text-6xl font-bold tracking-tight">
          TraffAgent — трафик за гранью разума
        </motion.h1>
        <p className="mt-4 text-lg text-zinc-600">Запускаем траф под любые ниши и цели</p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={onQuiz}>Запустить траф</Button>
          <Button href="https://t.me/traffagent">Похуй, делаем!</Button>
        </div>
      </div>

      {/* Бегущая строка */}
      <div className="overflow-hidden border-t border-b border-zinc-200 bg-zinc-50 py-3">
        <div className="animate-marquee whitespace-nowrap text-sm text-zinc-600">
          Meta (Facebook + Instagram + Threads) • YouTube • TikTok • Google • Telegram • Twitter
        </div>
      </div>
    </div>
  );
}

// =======================
// УСЛУГИ
// =======================

function Services({ onQuiz }: { onQuiz: () => void }) {
  const items = [
    "Лиды в бизнес",
    "Продажи в E-com",
    "Запуски инфо",
    "Финтех и SaaS",
  ];
  return (
    <Section id="services" className="py-20 text-center">
      <h2 className="text-3xl font-bold">Услуги</h2>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((it) => (
          <div key={it} className="card rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold">{it}</h3>
            <p className="mt-2 text-sm text-zinc-500">Запуск, оптимизация и масштабирование</p>
            <div className="mt-4">
              <Button onClick={onQuiz}>Запустить траф</Button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// =======================
// ПАРТНЁРЫ
// =======================

function Partners() {
  return (
    <Section id="partners" className="py-20 text-center bg-zinc-50">
      <h2 className="text-3xl font-bold">Партнёры</h2>
      <p className="mt-4 text-zinc-600">Работаем с крупными рекламными системами и сетями</p>
    </Section>
  );
}

// =======================
// ТАРИФЫ
// =======================

function Pricing({ onQuiz }: { onQuiz: () => void }) {
  const plans = [
    { name: "Старт", price: "от $1k", desc: "Для новых проектов", features: ["Запуск рекламы", "Базовая оптимизация"] },
    { name: "Рост", price: "%", desc: "Для масштабирования", features: ["Масштабирование", "Оптимизация", "Автоматизация"], highlight: true },
    { name: "Pro", price: "от $10k", desc: "Для больших бюджетов", features: ["Стратегия", "Команда", "Полная аналитика"] },
  ];
  return (
    <Section id="pricing" className="py-20 text-center">
      <h2 className="text-3xl font-bold">Тарифы</h2>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {plans.map((p, i) => (
          <div key={i} className={`rounded-xl border p-6 text-left ${p.highlight ? "border-zinc-400" : "border-zinc-200"}`}>
            {p.highlight && <span className="mb-2 inline-block rounded-full border border-zinc-300 px-2 py-0.5 text-xs">Популярный</span>}
            <h3 className="font-semibold text-lg">{p.name}</h3>
            <div className="mt-1 text-2xl font-bold">{p.price}</div>
            <p className="mt-1 text-sm text-zinc-600">{p.desc}</p>
            <ul className="mt-4 space-y-1 text-sm text-zinc-600">
              {p.features.map((f, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <Button onClick={onQuiz}>Берем</Button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// =======================
// FAQ
// =======================

function FAQ() {
  const faqs = [
    { q: "Как быстро запускается траф?", a: "Обычно за 1-3 дня после согласования." },
    { q: "С какими нишами работаете?", a: "E-com, SaaS, Mobile, инфо, финтех и другие." },
    { q: "Какие бюджеты нужны?", a: "Минимум от $1k в месяц." },
  ];
  return (
    <Section id="faq" className="py-20">
      <h2 className="text-3xl font-bold text-center">FAQ</h2>
      <div className="mt-10 max-w-2xl mx-auto space-y-6">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold">{f.q}</h3>
            <p className="mt-2 text-sm text-zinc-600">{f.a}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// =======================
// КВИЗ (упрощённый)
// =======================

function QuizModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const questions = [
    { text: "Ваш бюджет?", options: ["до $1k", "$1k–$5k", "$5k+"] },
    { text: "Ниша?", options: ["E-com", "SaaS", "Mobile", "Инфо", "Финтех", "Другое"] },
  ];

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 text-black shadow-lg">
        {step < questions.length && (
          <>
            <h3 className="text-lg font-semibold">{questions[step].text}</h3>
            <div className="mt-4 space-y-2">
              {questions[step].options.map((o) => (
                <button
                  key={o}
                  onClick={() => setStep(step + 1)}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-left hover:bg-zinc-100"
                >
                  {o}
                </button>
              ))}
            </div>
          </>
        )}
        {step === questions.length && (
          <div className="text-center space-y-4">
            <p className="font-medium">Спасибо! Дальше перейдите в Telegram 👇</p>
            <a href="https://t.me/traffagent" target="_blank" className="inline-block rounded-lg bg-black px-4 py-2 text-white">
              Перейти
            </a>
          </div>
        )}
        <button onClick={onClose} className="mt-6 text-sm text-zinc-500 hover:underline">
          Закрыть
        </button>
      </div>
    </div>
  );
}

// =======================
// APP
// =======================

export default function App() {
  const [quiz, setQuiz] = useState(false);
  return (
    <>
      <Hero onQuiz={() => setQuiz(true)} />
      <Services onQuiz={() => setQuiz(true)} />
      <Partners />
      <Pricing onQuiz={() => setQuiz(true)} />
      <FAQ />
      <QuizModal open={quiz} onClose={() => setQuiz(false)} />
    </>
  );
}
