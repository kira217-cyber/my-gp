import React, { useMemo } from "react";
import { DollarSign, Lock, Smartphone, BarChart3 } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

const ICONS = [DollarSign, Lock, Smartphone, BarChart3];

const WhyUs = () => {
  const { isBangla } = useLanguage();

  const PRIMARY = "#2f79c9";
  const SECONDARY = "#f07a2a";

  const content = useMemo(
    () => ({
      title: isBangla ? "কেন আমাদের বেছে নিবেন?" : "Why Choose Us?",
      items: isBangla
        ? [
            {
              title: "উচ্চ কমিশন",
              desc: "আমাদের এজেন্টদের জন্য রয়েছে আকর্ষণীয় কমিশন সুবিধা এবং দ্রুত আয়ের সুযোগ।",
            },
            {
              title: "নিরাপদ প্ল্যাটফর্ম",
              desc: "ব্যবহারকারীর তথ্য ও লেনদেন সুরক্ষিত রাখতে আমরা নিরাপদ সিস্টেম ব্যবহার করি।",
            },
            {
              title: "মোবাইল ফ্রেন্ডলি",
              desc: "মোবাইল, ট্যাবলেট এবং ডেস্কটপ সব ডিভাইসে সহজে ব্যবহার করা যায়।",
            },
            {
              title: "স্বচ্ছ রিপোর্টিং",
              desc: "এজেন্টরা সহজেই তাদের ইউজার, কমিশন এবং পারফরম্যান্স ট্র্যাক করতে পারবেন।",
            },
          ]
        : [
            {
              title: "High Commission",
              desc: "We offer attractive commission benefits and fast earning opportunities for agents.",
            },
            {
              title: "Secure Platform",
              desc: "We use a secure system to protect user data and transactions.",
            },
            {
              title: "Mobile Friendly",
              desc: "Easy to use on mobile, tablet, and desktop devices.",
            },
            {
              title: "Transparent Reports",
              desc: "Agents can easily track their users, commission, and performance.",
            },
          ],
    }),
    [isBangla],
  );

  return (
    <section className="w-full bg-[#07111f] pb-6 text-white md:pb-10">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2
          className="mb-10 text-center text-3xl font-extrabold md:text-4xl"
          style={{ color: SECONDARY }}
        >
          {content.title}
        </h2>

        <div className="rounded-2xl border border-white/10 bg-[#0b1728] p-6 shadow-2xl shadow-black/30 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {content.items.map((it, idx) => {
              const Icon = ICONS[idx] || DollarSign;

              return (
                <div
                  key={idx}
                  className="group rounded-xl border border-white/10 bg-white/[0.04] p-6 text-center transition hover:-translate-y-1 hover:bg-white/[0.07] hover:shadow-xl hover:shadow-black/20"
                >
                  <div
                    className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
                    }}
                  >
                    <span className="absolute inset-0 translate-x-8 translate-y-8 bg-black/10" />
                    <Icon
                      className="relative text-white"
                      size={42}
                      strokeWidth={2.5}
                    />
                  </div>

                  <h3
                    className="mb-3 text-lg font-extrabold"
                    style={{ color: SECONDARY }}
                  >
                    {it.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-slate-300">
                    {it.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
