import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  BadgeDollarSign,
  Calculator,
  DollarSign,
  BarChart3,
  Wallet,
} from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

const Commission = () => {
  const { isBangla } = useLanguage();
  const [open, setOpen] = useState(false);

  const PRIMARY = "#2f79c9";
  const SECONDARY = "#f07a2a";

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const t = useMemo(
    () => ({
      sectionTitle: isBangla ? "কমিশন প্ল্যান" : "Commission Plan",
      btnMore: isBangla ? "আরও বিস্তারিত" : "More Details",

      th: isBangla
        ? [
            "লেভেল",
            "নতুন রেজিস্ট্রেশন",
            "বেস কমিশন",
            "এক্সট্রা বোনাস",
            "শর্ত",
            "মোট কমিশন",
          ]
        : [
            "Level",
            "New Registration",
            "Base Commission",
            "Extra Bonus",
            "Requirement",
            "Total Commission",
          ],

      rows: isBangla
        ? [
            {
              level: "Level 1",
              newReg: "১ - ২০ ইউজার",
              base: "25%",
              extra: "0%",
              need: "সাধারণ এক্টিভিটি",
              total: "25%",
            },
            {
              level: "Level 2",
              newReg: "২১ - ৫০ ইউজার",
              base: "35%",
              extra: "5%",
              need: "নিয়মিত এক্টিভিটি",
              total: "40%",
            },
            {
              level: "Level 3",
              newReg: "৫১ - ১০০ ইউজার",
              base: "45%",
              extra: "10%",
              need: "হাই এক্টিভিটি",
              total: "55%",
            },
            {
              level: "VIP",
              newReg: "১০০+ ইউজার",
              base: "50%",
              extra: "10%",
              need: "টপ পারফরম্যান্স",
              total: "60%",
            },
          ]
        : [
            {
              level: "Level 1",
              newReg: "1 - 20 Users",
              base: "25%",
              extra: "0%",
              need: "Basic activity",
              total: "25%",
            },
            {
              level: "Level 2",
              newReg: "21 - 50 Users",
              base: "35%",
              extra: "5%",
              need: "Regular activity",
              total: "40%",
            },
            {
              level: "Level 3",
              newReg: "51 - 100 Users",
              base: "45%",
              extra: "10%",
              need: "High activity",
              total: "55%",
            },
            {
              level: "VIP",
              newReg: "100+ Users",
              base: "50%",
              extra: "10%",
              need: "Top performance",
              total: "60%",
            },
          ],

      modalTitle: isBangla ? "কমিশন কিভাবে কাজ করে?" : "How Commission Works?",
      bullets: isBangla
        ? [
            "আপনার রেফার করা ইউজারদের এক্টিভিটির উপর কমিশন হিসাব করা হবে।",
            "কমিশন রেট আপনার পারফরম্যান্স লেভেলের উপর নির্ভর করবে।",
            "উচ্চ এক্টিভিটি এবং বেশি ইউজার থাকলে কমিশন বাড়বে।",
            "কমিশন হিসাব করার সময় বোনাস এবং অপারেশনাল চার্জ বিবেচনা করা হতে পারে।",
          ]
        : [
            "Commission is calculated based on your referred users’ activity.",
            "Your commission rate depends on your performance level.",
            "Higher activity and more users can increase your commission.",
            "Bonus and operational charges may be considered during calculation.",
          ],

      formulaTitle: isBangla ? "কমিশন ফর্মুলা" : "Commission Formula",
      formulaLabels: isBangla
        ? [
            "ইউজার\nউইন/লস",
            "অপারেশন\nচার্জ",
            "বোনাস",
            "নেট\nপ্রফিট",
            "কমিশন\nরেট",
            "এজেন্ট\nকমিশন",
          ]
        : [
            "User\nWin/Loss",
            "Operation\nCharge",
            "Bonus",
            "Net\nProfit",
            "Commission\nRate",
            "Agent\nCommission",
          ],

      exampleTitle: isBangla ? "উদাহরণ" : "Example",
      exTh: isBangla
        ? ["নং", "উইন/লস", "অপারেশন", "বোনাস", "ফর্মুলা", "এজেন্ট কমিশন"]
        : [
            "No",
            "Win/Loss",
            "Operation",
            "Bonus",
            "Formula",
            "Agent Commission",
          ],

      exRows: [
        {
          no: "01",
          wl: "৳ 10,000",
          op: "৳ 1,000",
          bonus: "৳ 500",
          formula: "(10000 - 1000 - 500) × 40%",
          agent: "৳ 3,400",
        },
        {
          no: "02",
          wl: "৳ 25,000",
          op: "৳ 2,500",
          bonus: "৳ 1,000",
          formula: "(25000 - 2500 - 1000) × 50%",
          agent: "৳ 10,750",
        },
      ],

      exTotalLabel: isBangla ? "মোট" : "Total",
      exTotal: {
        wl: "৳ 35,000",
        op: "৳ 3,500",
        bonus: "৳ 1,500",
        agent: "৳ 14,150",
      },

      close: isBangla ? "বন্ধ করুন" : "Close",
    }),
    [isBangla],
  );

  return (
    <section className="w-full bg-[#07111f] py-10 text-white sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2
          className="mb-8 text-center text-3xl font-extrabold md:text-4xl"
          style={{ color: SECONDARY }}
        >
          {t.sectionTitle}
        </h2>

        <div className="w-full overflow-x-auto rounded-xl border border-white/10 shadow-2xl shadow-black/30">
          <div className="min-w-[980px]">
            <div
              className="grid grid-cols-6 text-base font-extrabold md:text-lg"
              style={{
                background: `linear-gradient(90deg, ${PRIMARY}, ${SECONDARY})`,
              }}
            >
              {t.th.map((h, i) => (
                <div
                  key={i}
                  className="border-r border-white/15 px-4 py-3 text-center last:border-r-0"
                >
                  {h}
                </div>
              ))}
            </div>

            {t.rows.map((r, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-6 font-semibold ${
                  idx % 2 === 0 ? "bg-white/[0.04]" : "bg-white/[0.07]"
                }`}
              >
                <Cell>{r.level}</Cell>
                <Cell>{r.newReg}</Cell>
                <Cell>{r.base}</Cell>
                <Cell>{r.extra}</Cell>
                <Cell>{r.need}</Cell>
                <Cell last>{r.total}</Cell>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setOpen(true)}
            className="rounded-md px-10 py-3 font-extrabold text-white transition hover:scale-[1.03] hover:opacity-90"
            style={{ backgroundColor: PRIMARY }}
            type="button"
          >
            {t.btnMore}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />

            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-6"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-[#0b1728] text-white shadow-2xl shadow-black/50"
              >
                <div className="relative px-4 pt-6 sm:px-8 sm:pt-8">
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute right-3 top-3 rounded p-2 text-white transition hover:bg-white/10 sm:right-5 sm:top-5"
                    aria-label="Close modal"
                    type="button"
                  >
                    <X />
                  </button>

                  <h3
                    className="mb-4 text-3xl font-extrabold sm:text-4xl"
                    style={{ color: SECONDARY }}
                  >
                    {t.modalTitle}
                  </h3>
                </div>

                <div className="max-h-[78vh] overflow-y-auto px-4 pb-8 sm:px-8 [scrollbar-width:none]">
                  <ul className="list-disc space-y-2 pl-6 text-slate-300">
                    {t.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>

                  <h4
                    className="mt-7 text-2xl font-extrabold sm:text-3xl"
                    style={{ color: SECONDARY }}
                  >
                    {t.formulaTitle}
                  </h4>

                  <div className="mt-6 flex flex-wrap items-start justify-center gap-5 sm:gap-7">
                    <FormulaItem Icon={User} label={t.formulaLabels[0]} />
                    <Sign />
                    <FormulaItem
                      Icon={BadgeDollarSign}
                      label={t.formulaLabels[1]}
                    />
                    <Sign />
                    <FormulaItem Icon={Calculator} label={t.formulaLabels[2]} />
                    <Sign equal />
                    <FormulaItem Icon={DollarSign} label={t.formulaLabels[3]} />
                    <Sign multiply />
                    <FormulaItem Icon={BarChart3} label={t.formulaLabels[4]} />
                    <Sign equal />
                    <FormulaItem Icon={Wallet} label={t.formulaLabels[5]} />
                  </div>

                  <p className="mt-8 text-lg font-extrabold sm:text-xl">
                    {t.exampleTitle}
                  </p>

                  <div className="mt-4 w-full overflow-x-auto rounded-lg border border-white/10">
                    <div className="min-w-[920px]">
                      <div
                        className="grid grid-cols-6 text-sm font-extrabold sm:text-base"
                        style={{
                          background: `linear-gradient(90deg, ${PRIMARY}, ${SECONDARY})`,
                        }}
                      >
                        {t.exTh.map((h, i) => (
                          <div
                            key={i}
                            className="border-r border-white/15 px-3 py-3 text-center last:border-r-0"
                          >
                            {h}
                          </div>
                        ))}
                      </div>

                      {t.exRows.map((r, idx) => (
                        <div
                          key={idx}
                          className={`grid grid-cols-6 text-sm sm:text-base ${
                            idx % 2 === 0
                              ? "bg-white/[0.04]"
                              : "bg-white/[0.07]"
                          }`}
                        >
                          <ExCell>{r.no}</ExCell>
                          <ExCell strong>{r.wl}</ExCell>
                          <ExCell strong>{r.op}</ExCell>
                          <ExCell strong>{r.bonus}</ExCell>
                          <ExCell>{r.formula}</ExCell>
                          <ExCell strong last>
                            {r.agent}
                          </ExCell>
                        </div>
                      ))}

                      <div
                        className="grid grid-cols-6 font-extrabold text-white"
                        style={{ backgroundColor: SECONDARY }}
                      >
                        <ExCell>{t.exTotalLabel}</ExCell>
                        <ExCell>{t.exTotal.wl}</ExCell>
                        <ExCell>{t.exTotal.op}</ExCell>
                        <ExCell>{t.exTotal.bonus}</ExCell>
                        <ExCell />
                        <ExCell last>{t.exTotal.agent}</ExCell>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() => setOpen(false)}
                      className="rounded-md px-6 py-2 font-extrabold text-white transition hover:scale-[1.03] hover:opacity-90"
                      style={{ backgroundColor: PRIMARY }}
                      type="button"
                    >
                      {t.close}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Commission;

const Cell = ({ children, last }) => (
  <div
    className={`border-t border-white/10 px-2 py-4 text-center font-semibold text-slate-100 ${
      last ? "" : "border-r"
    } border-white/10`}
  >
    {children}
  </div>
);

const ExCell = ({ children, strong, last }) => (
  <div
    className={`border-t border-white/10 px-3 py-3 text-center ${
      last ? "" : "border-r"
    } border-white/10`}
    style={{ fontWeight: strong ? 700 : 500 }}
  >
    {children}
  </div>
);

const FormulaItem = ({ Icon, label }) => {
  const PRIMARY = "#2f79c9";
  const parts = String(label || "").split("\n");

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16"
        style={{ backgroundColor: PRIMARY }}
      >
        <Icon className="text-white" size={30} strokeWidth={2.5} />
      </div>

      <div className="text-center text-sm font-bold leading-snug text-slate-200">
        {parts.map((p, i) => (
          <div key={i}>{p}</div>
        ))}
      </div>
    </div>
  );
};

const Sign = ({ equal, multiply }) => {
  const SECONDARY = "#f07a2a";
  const text = equal ? "=" : multiply ? "×" : "−";

  return (
    <div
      className="mt-4 text-4xl font-extrabold sm:mt-5"
      style={{ color: SECONDARY }}
    >
      {text}
    </div>
  );
};
