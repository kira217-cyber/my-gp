import React, { useMemo } from "react";
import { Check } from "lucide-react";
import { Link } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

const Agent = () => {
  const { isBangla } = useLanguage();

  const PRIMARY = "#2f79c9";
  const SECONDARY = "#f07a2a";

  const t = useMemo(
    () => ({
      title: isBangla ? "আজই এজেন্ট হন!" : "Become an Agent Today!",
      p1: isBangla
        ? "আমাদের প্ল্যাটফর্ম এজেন্টদের জন্য দ্রুত আয় এবং সহজ ম্যানেজমেন্টের সুযোগ তৈরি করে।"
        : "Our platform creates fast earning opportunities and easy management for agents.",
      p2: isBangla
        ? "আপনি সহজেই আপনার ইউজার নেটওয়ার্ক তৈরি করে কমিশন আয় শুরু করতে পারবেন।"
        : "You can easily build your user network and start earning commission.",
      list: isBangla
        ? [
            "উচ্চ কমিশন সুবিধা",
            "দ্রুত পেমেন্ট সাপোর্ট",
            "সহজ এজেন্ট ড্যাশবোর্ড",
            "নিরাপদ এবং বিশ্বস্ত প্ল্যাটফর্ম",
          ]
        : [
            "High commission benefits",
            "Fast payment support",
            "Easy agent dashboard",
            "Safe and trusted platform",
          ],
      p3: isBangla
        ? "এখনই যোগ দিন এবং আপনার অনলাইন ইনকাম শুরু করুন।"
        : "Join now and start your online income journey.",
      strip: isBangla ? "কমিশন অর্জন করুন" : "Earn Commission",
      btn: isBangla ? "এখনই যোগদান করুন" : "Join Now",
      percentText: "60%",
    }),
    [isBangla],
  );

  return (
    <section className="w-full bg-[#07111f] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2
          className="mb-10 text-center text-3xl font-extrabold md:text-4xl"
          style={{ color: SECONDARY }}
        >
          {t.title}
        </h2>

        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-5">
            <p className="text-base leading-relaxed text-slate-300">{t.p1}</p>
            <p className="text-base leading-relaxed text-slate-300">{t.p2}</p>

            <ul className="space-y-3 pt-2">
              {t.list.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    <Check size={16} className="text-white" />
                  </span>

                  <span className="leading-relaxed text-slate-100">{item}</span>
                </li>
              ))}
            </ul>

            <p className="pt-2 text-base leading-relaxed text-slate-300">
              {t.p3}
            </p>
          </div>

          <div
            className="flex items-center justify-center rounded-xl border p-6 shadow-2xl shadow-black/30 sm:p-8"
            style={{
              background: `linear-gradient(135deg, ${SECONDARY}, ${PRIMARY})`,
              borderColor: "rgba(255,255,255,0.14)",
            }}
          >
            <div className="w-full max-w-md text-center">
              <div className="text-7xl font-extrabold leading-none text-white md:text-8xl">
                {t.percentText}
              </div>

              <div className="mt-4">
                <span className="inline-block rounded-full bg-white/15 px-6 py-2 text-xl font-extrabold tracking-wide text-white backdrop-blur">
                  {t.strip}
                </span>
              </div>

              <div className="mt-7">
                <Link
                  to="/register"
                  className="inline-block rounded-md bg-[#07111f] px-8 py-3 font-bold text-white transition hover:scale-[1.03] hover:opacity-90"
                >
                  {t.btn}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Agent;
