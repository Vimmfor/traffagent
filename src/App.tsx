import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Menu, Sparkles, X } from "lucide-react";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}
const fbqTrack = (event: string, params?: Record<string, any>) => {
  try {
    window.fbq && window.fbq("track", event, params || {});
  } catch {}
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

type SectionProps = {
  id?: string;
  children: React.ReactNode;
  className?: string;
  bg?: string;
};
const Section: React.FC<SectionProps> = ({ id, children, className = "", bg = "" }) => (
  <section id={id} className={`${bg} mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </section>
);

const Kicker: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <span
    className={`inline-flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 ${className}`}
  >
    <Sparkles className="h-3.5 w-3.5" /> {children}
  </span>
);

const H2: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <h2
    className={`mt-2 text-[22px] sm:text-2xl md:text-4xl font-semibold leading-tight tracking-tight ${className}`}
  >
    {children}
  </h2>
);

// -------------------- Hero --------------------
function KPMobileHero({ onQuiz }: { onQuiz: () => void }) {
  return (
    <Section
      id="home"
      className="min-h-[82vh] flex flex-col justify-center pt-8 pb-12 sm:pt-14 sm:pb-16"
      bg="bg-white text-black"
    >
      <div className="-mx-4 sm:mx-0">
        <div className="overflow-hidden border border-zinc-200 sm:rounded-md">
          <div className="bg-red-600 text-white px-3 py-2 flex items-center justify-between">
            <div className="text-[11px] font-extrabold uppercase tracking-wider">Срочно</div>
            <div className="text-[11px] font-semibold">Объявление</div>
          </div>

          <div className="px-4 sm:px-5 py-6 space-y-6">
            <div className="inline-flex items-center gap-2">
              <span className="bg-yellow-400 text-black text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                Эксклюзив
              </span>
              <span className="text-[10px] text-zinc-600">TraffAgent • медиа баинг</span>
            </div>

            <h1 className="text-[36px] sm:text-[40px] leading-[1.1] font-extrabold uppercase tracking-tight">
              Трафик без границ
            </h1>
            <p className="text-[16px] sm:text-[17px] leading-snug text-zinc-700 max-w-[46ch]">
              Выходим за пределы стандартного таргета: медиабаинг, креативы, аналитика и
              автоматизация, которые превращают клики в прибыль.
            </p>

            <div className="mt-2 grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  fbqTrack("Lead", { place: "kp_mobile_start" });
                  onQuiz();
                }}
                className="inline-flex items-center justify-center rounded-none sm:rounded-md bg-black text-white px-5 py-4.5 text-[16px] font-extrabold uppercase tracking-wide w-full"
              >
                Хочу продажи
              </button>
              <a
                href="https://t.me/traffagent"
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => fbqTrack("Lead", { place: "kp_mobile_tg" })}
                className="inline-flex items-center justify-center rounded-none sm:rounded-md border border-zinc-900 px-5 py-4.5 text-[16px] font-extrabold uppercase tracking-wide w-full"
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

function Hero({ onQuiz }: { onQuiz: () => void }) {
  return (
    <>
      <div className="sm:hidden">
        <KPMobileHero onQuiz={onQuiz} />
      </div>
      <div className="hidden sm:block">
        <Section
          id="home"
          className="pt-14 pb-14 sm:pt-16 sm:pb-16"
          bg="bg-white text-zinc-900"
        >
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center"
          >
            <motion.div variants={item} className="lg:col-span-7">
              <div className="bg-red-600 text-white px-3 py-2 flex items-center justify-between rounded-md mb-6">
                <div className="text-[11px] font-extrabold uppercase tracking-wider">Срочно</div>
                <div className="text-[11px] font-semibold">Объявление</div>
              </div>
              <Kicker>Трафик без границ</Kicker>
              <h1 className="mt-2 text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
                TraffAgent - трафик без границ
              </h1>
              <p className="mt-5 max-w-2xl text-zinc-600 text-base sm:text-lg">
                Выходим за пределы стандартного таргета: медиабаинг, креативы, аналитика и
                автоматизация, которые превращают клики в прибыль.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3">
                <button
                  onClick={() => {
                    fbqTrack("Lead", { place: "hero_start" });
                    onQuiz();
                  }}
                  className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-base sm:text-sm font-semibold text-white w-full sm:w-auto"
                >
                  Хочу продажи
                </button>
                <a
                  href="https://t.me/traffagent"
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => fbqTrack("Lead", { place: "hero_tg" })}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 px-5 py-3 text-base sm:text-sm font-semibold w-full sm:w-auto"
                >
                  Похуй, делаем!
                </a>
              </div>
            </motion.div>
          </motion.div>
        </Section>
      </div>
    </>
  );
}

// -------------------- Main --------------------
export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <Hero onQuiz={() => {}} />
    </div>
  );
}
