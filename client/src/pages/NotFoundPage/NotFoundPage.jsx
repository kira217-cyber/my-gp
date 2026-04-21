import React, { useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const t = useMemo(() => {
    return {
      badge: isBangla ? "পেজ নেই" : "NOT FOUND",
      title: isBangla ? "পেজটি পাওয়া যায়নি" : "Page Not Found",
      desc: isBangla
        ? "আপনি যে পেজটি খুঁজছেন তা হয়তো সরানো হয়েছে, নাম পরিবর্তন হয়েছে অথবা সাময়িকভাবে অনুপলব্ধ।"
        : "The page you’re looking for may have been removed, renamed, or is temporarily unavailable.",
      home: isBangla ? "হোমে যান" : "Go Home",
      back: isBangla ? "পিছনে যান" : "Go Back",
      tip: isBangla
        ? "Tip: Navbar থেকে মেনু ব্যবহার করে আবার খুঁজে দেখুন।"
        : "Tip: Use the navbar menu to find what you need.",
      wrongRoute: isBangla ? "ভুল লিংক" : "Wrong Route",
      hint: isBangla
        ? "সঠিক লিংক দিয়ে আবার চেষ্টা করুন।"
        : "Try again with the correct link.",
      copyright: isBangla
        ? `© ${new Date().getFullYear()} BABU88 — সর্বস্বত্ব সংরক্ষিত।`
        : `© ${new Date().getFullYear()} BABU88 — All rights reserved.`,
    };
  }, [isBangla]);

  return (
    <div className="min-h-screen bg-[#2b2b2b] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl">
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-black/25 border border-white/10 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.55)] overflow-hidden"
        >
          {/* Top highlight bar */}
          <div className="h-2 w-full bg-[#f5b400]" />

          <div className="p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left */}
              <div>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.08 }}
                  className="inline-flex items-center gap-2 bg-[#f5b400] text-black font-extrabold px-4 py-2 rounded-md"
                >
                  <span className="text-lg">404</span>
                  <span className="text-sm font-bold">{t.badge}</span>
                </motion.div>

                <h1 className="mt-5 text-2xl sm:text-4xl font-extrabold leading-tight">
                  {t.title}
                </h1>

                <p className="mt-3 text-white/80 text-sm sm:text-base leading-relaxed">
                  {t.desc}
                </p>

                {/* Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate("/")}
                    className="cursor-pointer inline-flex items-center justify-center gap-2 bg-[#f5b400] text-black font-extrabold px-6 py-3 rounded-md hover:bg-[#e2a800] transition"
                  >
                    <Home size={18} />
                    {t.home}
                  </button>

                  <button
                    onClick={() => navigate(-1)}
                    className="cursor-pointer inline-flex items-center justify-center gap-2 bg-white/10 border border-white/15 text-white font-bold px-6 py-3 rounded-md hover:bg-white/15 transition"
                  >
                    <ArrowLeft size={18} />
                    {t.back}
                  </button>
                </div>

                <p className="mt-4 text-xs sm:text-sm text-white/60">{t.tip}</p>
              </div>

              {/* Right (Visual) */}
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.12 }}
                  className="relative bg-[#f5b400] rounded-xl p-8 sm:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.45)] overflow-hidden"
                >
                  {/* decorative circles */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-black/10" />
                  <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-black/10" />

                  <div className="text-center">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                      className="text-black font-extrabold text-6xl sm:text-7xl leading-none"
                    >
                      404
                    </motion.div>

                    <div className="mt-3 inline-block bg-[#2b67b8] px-4 py-2">
                      <span className="text-white font-extrabold text-base sm:text-lg">
                        {t.wrongRoute}
                      </span>
                    </div>

                    <p className="mt-4 text-black/80 text-sm sm:text-base">
                      {t.hint}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom small note */}
        <div className="mt-6 text-center text-xs sm:text-sm text-white/50">
          {t.copyright}
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
